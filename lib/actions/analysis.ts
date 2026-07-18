'use server'

import Groq from 'groq-sdk'
import { supabaseAdmin } from '@/lib/supabase/server'
import { verifySession } from '@/lib/actions/evidence'
import { redactPII } from '@/lib/utils/redact'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! })

// ── System prompt ──────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are assisting a cyber harassment documentation tool used in Pakistan. Your job is to review evidence (chat logs, extracted message text, platform, dates) provided by a possible victim, reconstruct a chronological timeline of what happened, and help prepare a complaint draft aligned with Pakistan's Prevention of Electronic Crimes Act (PECA) 2016.

CRITICAL RULES:
1. Respond with ONLY valid JSON. No preamble, no markdown code fences, no explanation outside the JSON.
2. NEVER state certainty or make legal conclusions. Use phrasing like "this appears to..." or "this may fall under..." — never "this is..." or "this constitutes...".
3. You are not a lawyer and this is not legal advice. The output is a starting draft for the victim (or their lawyer) to review and edit.
4. Base your analysis only on what is actually described in the evidence. Do not invent details, names, or events not present in the text.
5. RECONSTRUCT A TIMELINE: order the evidence chronologically using the incident dates provided. If dates are missing for some evidence, note that explicitly rather than guessing an order. If the sequence of events reveals an escalating pattern (e.g. increasing frequency, threats, requests to meet), mention that pattern factually.
6. FLAG GAPS: if there are unexplained time gaps between pieces of evidence, or if the evidence seems incomplete to tell a full story, note this so the victim knows what additional evidence might strengthen their case.
7. If the evidence is ambiguous or insufficient to suggest a category, say so honestly rather than guessing.
8. Any phone numbers, CNIC numbers, emails, or long ID numbers in the evidence text have already been redacted and replaced with [REDACTED] tags — do not attempt to reconstruct or guess the original values.

Respond with this exact JSON shape:
{
  "category_suggestion": "string",
  "confidence_score": number between 0.0 and 1.0,
  "key_evidence_points": [
    { "type": "string", "note": "string — should reference chronological order and any pattern or gap observed" }
  ],
  "draft_complaint_text": "string — formal, editable, third-person paragraph(s) describing the incident in chronological order. No name, address, or CNIC — those are filled in by hand."
}`

type EvidenceForAnalysis = {
    platform: string
    evidence_type: string
    captured_at: string | null
    file_name: string
    message_text: string | null
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
        .select('platform, evidence_type, captured_at, file_name, message_text')
        .eq('case_id', caseId)
        .order('captured_at', { ascending: true, nullsFirst: false })

    if (evidenceError) {
        return { error: 'Could not load evidence for analysis.' }
    }

    if (!evidenceRows || evidenceRows.length === 0) {
        return { error: 'Please upload at least one piece of evidence before analyzing.' }
    }

    const evidenceList = evidenceRows as EvidenceForAnalysis[]

    // Build evidence summary — include redacted message text where available
    const evidenceSummary = evidenceList
        .map((e, i) => {
            const date = e.captured_at
                ? new Date(e.captured_at).toLocaleString()
                : 'date not specified'
            const text = e.message_text
                ? redactPII(e.message_text)
                : '(no extracted text — image only, not reviewed)'
            return `Evidence #${i + 1}\nPlatform: ${e.platform}\nType: ${e.evidence_type}\nDate/time: ${date}\nFile: ${e.file_name}\nMessage content: ${text}\n`
        })
        .join('\n---\n')

    const userMessage = `Here is the evidence uploaded for this case, listed in chronological order where dates are known:\n\n${evidenceSummary}\n\nReconstruct a chronological account of what happened, note any patterns or gaps, and provide your analysis in the required JSON format.`

    // Call Groq API
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