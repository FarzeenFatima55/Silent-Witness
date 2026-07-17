'use server'

import Groq from 'groq-sdk'
import { supabaseAdmin } from '@/lib/supabase/server'
import { verifySession } from '@/lib/actions/evidence'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! })

// ── System prompt ──────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are assisting a cyber harassment documentation tool used in Pakistan. Your job is to review evidence descriptions (chat logs, message content, platform, dates) provided by a possible victim and help them prepare a complaint draft aligned with Pakistan's Prevention of Electronic Crimes Act (PECA) 2016.

CRITICAL RULES:
1. You must respond with ONLY valid JSON. No preamble, no markdown code fences, no explanation outside the JSON.
2. NEVER state certainty or make legal conclusions. Use phrasing like "this appears to..." or "this may fall under..." — never "this is..." or "this constitutes...".
3. You are not a lawyer and this is not legal advice. The output is a starting draft for the victim (or their lawyer) to review and edit.
4. Base your analysis only on what is actually described in the evidence. Do not invent details.
5. If the evidence is ambiguous or insufficient to suggest a category, say so honestly in your output rather than guessing.

Respond with this exact JSON shape:
{
  "category_suggestion": "string",
  "confidence_score": number between 0.0 and 1.0,
  "key_evidence_points": [
    { "type": "string", "note": "string" }
  ],
  "draft_complaint_text": "string"
}`

type EvidenceForAnalysis = {
    platform: string
    evidence_type: string
    captured_at: string | null
    file_name: string
}

// ── analyzeCase ────────────────────────────────────────────────────────────
export async function analyzeCase(
    caseId: string
): Promise<
    | {
        success: true
        analysis: {
            analysis_id: string
            category_suggestion: string | null
            confidence_score: number | null
            key_evidence_points: unknown
            draft_complaint_text: string | null
        }
    }
    | { error: string }
> {
    const session = await verifySession(caseId)
    if (!session.ok) return { error: session.error }

    const { data: evidenceRows, error: evidenceError } = await supabaseAdmin
        .from('evidence')
        .select('platform, evidence_type, captured_at, file_name')
        .eq('case_id', caseId)
        .order('created_at', { ascending: true })

    if (evidenceError) {
        return { error: 'Could not load evidence for analysis.' }
    }

    if (!evidenceRows || evidenceRows.length === 0) {
        return { error: 'Please upload at least one piece of evidence before analyzing.' }
    }

    const evidenceList = evidenceRows as EvidenceForAnalysis[]

    const evidenceSummary = evidenceList
        .map((e, i) => {
            const date = e.captured_at ? new Date(e.captured_at).toLocaleDateString() : 'date not specified'
            return `${i + 1}. Platform: ${e.platform} | Type: ${e.evidence_type} | Incident date: ${date} | File: ${e.file_name}`
        })
        .join('\n')

    const userMessage = `Here is a summary of the evidence uploaded for this case:\n\n${evidenceSummary}\n\nBased on this evidence metadata, provide your analysis in the required JSON format. Since you cannot see the actual message content (only file metadata), be conservative in your confidence score and note in key_evidence_points that a full review of the actual message content by a human is still required.`

    let responseText: string
    try {
        const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: userMessage },
            ],
            response_format: { type: 'json_object' },
        })

        const text = completion.choices[0]?.message?.content
        if (!text) {
            return { error: 'AI did not return a readable response. Please try again.' }
        }
        responseText = text
    } catch (err) {
        console.error('Groq API error:', err)
        return { error: 'Could not reach the AI service. Please try again in a moment.' }
    }

    const cleaned = responseText.replace(/```json|```/g, '').trim()
    let parsed: {
        category_suggestion: string
        confidence_score: number
        key_evidence_points: { type: string; note: string }[]
        draft_complaint_text: string
    }
    try {
        parsed = JSON.parse(cleaned)
    } catch (err) {
        console.error('JSON parse error:', err, 'Raw response:', responseText)
        return { error: 'AI response could not be understood. Please try again.' }
    }

    const { data: row, error: insertError } = await supabaseAdmin
        .from('ai_analysis')
        .insert({
            case_id: caseId,
            category_suggestion: parsed.category_suggestion,
            confidence_score: parsed.confidence_score,
            key_evidence_points: parsed.key_evidence_points,
            draft_complaint_text: parsed.draft_complaint_text,
            reviewed_by_user: false,
        })
        .select('analysis_id, category_suggestion, confidence_score, key_evidence_points, draft_complaint_text')
        .single()

    if (insertError || !row) {
        console.error('Supabase insert error:', insertError)
        return { error: 'Analysis completed but could not be saved. Please try again.' }
    }

    await supabaseAdmin.from('cases').update({ status: 'reviewed' }).eq('case_id', caseId)

    return { success: true, analysis: row }
}

// ── getLatestAnalysis ──────────────────────────────────────────────────────
export async function getLatestAnalysis(
    caseId: string
): Promise<
    | {
        success: true
        analysis: {
            analysis_id: string
            category_suggestion: string | null
            confidence_score: number | null
            key_evidence_points: unknown
            draft_complaint_text: string | null
            reviewed_by_user: boolean
        } | null
    }
    | { error: string }
> {
    const session = await verifySession(caseId)
    if (!session.ok) return { error: session.error }

    const { data, error } = await supabaseAdmin
        .from('ai_analysis')
        .select('analysis_id, category_suggestion, confidence_score, key_evidence_points, draft_complaint_text, reviewed_by_user')
        .eq('case_id', caseId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

    if (error) return { error: 'Could not load analysis.' }

    return { success: true, analysis: data }
}

// ── updateDraftComplaint ───────────────────────────────────────────────────
export async function updateDraftComplaint(
    caseId: string,
    analysisId: string,
    newText: string
): Promise<{ success: true } | { error: string }> {
    const session = await verifySession(caseId)
    if (!session.ok) return { error: session.error }

    const { error } = await supabaseAdmin
        .from('ai_analysis')
        .update({ draft_complaint_text: newText, reviewed_by_user: true })
        .eq('analysis_id', analysisId)
        .eq('case_id', caseId)

    if (error) return { error: 'Could not save your edits. Please try again.' }

    return { success: true }
}