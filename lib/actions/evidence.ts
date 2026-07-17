'use server'

import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { supabaseAdmin } from '@/lib/supabase/server'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'

const JWT_SECRET = process.env.JWT_SECRET!

// ── Shared session verifier ───────────────────────────────────────────────────
export async function verifySession(
    caseId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
    const cookieStore = await cookies()
    const token = cookieStore.get('sw_session')?.value

    if (!token) return { ok: false, error: 'No session found. Please access your case first.' }

    try {
        const payload = jwt.verify(token, JWT_SECRET) as { case_id: string }
        if (payload.case_id !== caseId) {
            return { ok: false, error: 'Session does not match this case.' }
        }
        return { ok: true }
    } catch {
        return { ok: false, error: 'Session expired or invalid. Please log in again.' }
    }
}

// ── Allowed MIME types (mirror Supabase bucket policy) ───────────────────────
const ALLOWED_MIME_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'text/plain',
    'application/pdf',
])

const MAX_BYTES = 50 * 1024 * 1024 // 50 MB

export type Platform = 'whatsapp' | 'instagram' | 'facebook' | 'other'

// ── uploadEvidence ────────────────────────────────────────────────────────────
export async function uploadEvidence(
    caseId: string,
    formData: FormData
): Promise<
    | {
          success: true
          evidence: {
              evidence_id: string
              file_url: string
              platform: string
              evidence_type: string
              captured_at: string | null
              file_name: string
              created_at: string
          }
      }
    | { error: string }
> {
    // 1. Verify session
    const session = await verifySession(caseId)
    if (!session.ok) return { error: session.error }

    // 2. Extract form fields
    const file = formData.get('file') as File | null
    const platform = (formData.get('platform') as Platform) ?? 'other'
    const capturedAt = formData.get('capturedAt') as string | null

    if (!file || file.size === 0) return { error: 'No file provided.' }
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
        return { error: `File type "${file.type}" is not allowed.` }
    }
    if (file.size > MAX_BYTES) {
        return { error: 'File exceeds the 50 MB limit.' }
    }

    // 3. Determine evidence_type from MIME
    const evidenceType = file.type.startsWith('image/') ? 'screenshot' : 'document'

    // 4. Build storage path
    const ext = path.extname(file.name) || ''
    const storageKey = `evidence/${caseId}/${uuidv4()}${ext}`

    // 5. Upload to Supabase Storage
    const arrayBuffer = await file.arrayBuffer()
    const { error: uploadError } = await supabaseAdmin.storage
        .from('evidence')
        .upload(storageKey, Buffer.from(arrayBuffer), {
            contentType: file.type,
            upsert: false,
        })

    if (uploadError) {
        return { error: `Storage upload failed: ${uploadError.message}` }
    }

    // 6. The file_url column stores the internal storage key (not a public URL)
    //    because the bucket is private. Use getEvidenceSignedUrl() to serve files.
    const fileUrl = storageKey

    // 7. Insert evidence row
    const { data: row, error: insertError } = await supabaseAdmin
        .from('evidence')
        .insert({
            case_id: caseId,
            file_url: fileUrl,
            file_name: file.name,
            platform,
            evidence_type: evidenceType,
            captured_at: capturedAt || null,
        })
        .select('evidence_id, file_url, platform, evidence_type, captured_at, file_name, created_at')
        .single()

    if (insertError || !row) {
        // Best-effort: try to clean up the orphaned storage object
        await supabaseAdmin.storage.from('evidence').remove([storageKey])
        return { error: 'Could not save evidence record. Please try again.' }
    }

    return { success: true, evidence: row }
}

// ── listEvidence ──────────────────────────────────────────────────────────────
export async function listEvidence(
    caseId: string
): Promise<
    | {
          success: true
          items: {
              evidence_id: string
              file_url: string
              platform: string
              evidence_type: string
              captured_at: string | null
              file_name: string
              created_at: string
          }[]
      }
    | { error: string }
> {
    const session = await verifySession(caseId)
    if (!session.ok) return { error: session.error }

    const { data, error } = await supabaseAdmin
        .from('evidence')
        .select('evidence_id, file_url, platform, evidence_type, captured_at, file_name, created_at')
        .eq('case_id', caseId)
        .order('created_at', { ascending: false })

    if (error) return { error: 'Could not load evidence.' }

    return { success: true, items: data ?? [] }
}

// ── getEvidenceSignedUrl ──────────────────────────────────────────────────────
export async function getEvidenceSignedUrl(
    caseId: string,
    evidenceId: string
): Promise<{ url: string } | { error: string }> {
    // 1. Verify session belongs to this case
    const session = await verifySession(caseId)
    if (!session.ok) return { error: session.error }

    // 2. Fetch the storage key from the evidence row
    const { data: row, error: fetchError } = await supabaseAdmin
        .from('evidence')
        .select('file_url')
        .eq('evidence_id', evidenceId)
        .eq('case_id', caseId)   // double-check ownership
        .single()

    if (fetchError || !row) {
        return { error: 'Evidence item not found or access denied.' }
    }

    const storagePath = row.file_url as string

    // 3. Create a 5-minute signed URL
    const { data: signedData, error: signError } = await supabaseAdmin.storage
        .from('evidence')
        .createSignedUrl(storagePath, 300)

    if (signError || !signedData?.signedUrl) {
        return { error: 'Could not generate a download link. Please try again.' }
    }

    return { url: signedData.signedUrl }
}