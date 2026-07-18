'use server'

import { supabaseAdmin } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET! // add this to .env.local

// ---------- CREATE CASE ----------
export async function createCase(pin?: string) {
    // 1. Generate case code via Postgres function
    const { data: codeData, error: codeError } = await supabaseAdmin.rpc(
        'generate_case_code'
    )

    if (codeError || !codeData) {
        return { error: 'Could not generate case code. Please try again.' }
    }

    const caseCode = codeData as string



    // 2. Hash PIN if provided (using pgcrypto via SQL, not JS)
    let pinHash: string | null = null
    if (pin) {
        const { data: hashData, error: hashError } = await supabaseAdmin.rpc(
            'hash_pin',
            { p_pin: pin }
        )
        if (hashError) {
            return { error: 'Could not secure PIN. Please try again.' }
        }
        pinHash = hashData as string
    }

    // 3. Insert case row
    const { data: caseRow, error: insertError } = await supabaseAdmin
        .from('cases')
        .insert({
            case_code: caseCode,
            pin_hash: pinHash,
            status: 'draft',
        })
        .select('case_id, case_code')
        .single()

    if (insertError || !caseRow) {
        return { error: 'Could not create case. Please try again.' }
    }

    // 4. Issue session cookie so the user is auto-logged into this case
    const token = jwt.sign({ case_id: caseRow.case_id }, JWT_SECRET, {
        expiresIn: '2h',
    })

    const cookieStore = await cookies()
    cookieStore.set('sw_session', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 60 * 60 * 2, // 2 hours
        path: '/',
    })

    return { case_code: caseRow.case_code, case_id: caseRow.case_id }
}

// ---------- RETRIEVE CASE (login with code + PIN) ----------
export async function retrieveCase(caseCode: string, pin?: string) {
    // Basic rate limiting note: for production, track attempts per IP
    // in a Postgres table or Redis. Skipping full implementation here
    // for hackathon timeline — flag this as a known gap.

    const { data, error } = await supabaseAdmin.rpc('verify_case_access', {
        p_case_code: caseCode,
        p_pin: pin ?? null,
    })

    if (error || !data || data.length === 0) {
        return { error: 'Invalid code or PIN.' }
    }

    const result = data[0]

    // Issue a short-lived session token
    const token = jwt.sign({ case_id: result.case_id }, JWT_SECRET, {
        expiresIn: '2h',
    })

    const cookieStore = await cookies()
    cookieStore.set('sw_session', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 60 * 60 * 2, // 2 hours
        path: '/',
    })

    return { success: true, case_id: result.case_id }
}
// ---------- GET CASE CODE (for display purposes, e.g. PDF export) ----------
export async function getCaseCode(caseId: string): Promise<{ case_code: string } | { error: string }> {
    const { data, error } = await supabaseAdmin
        .from('cases')
        .select('case_code')
        .eq('case_id', caseId)
        .single()

    if (error || !data) {
        return { error: 'Could not fetch case code.' }
    }

    return { case_code: data.case_code }
}
// ---------- DELETE CASE (permanently removes case, evidence, and storage files) ----------
export async function deleteCase(caseId: string): Promise<{ success: true } | { error: string }> {
    // 1. Verify session belongs to this case
    const cookieStore = await cookies()
    const token = cookieStore.get('sw_session')?.value

    if (!token) return { error: 'No session found.' }

    try {
        const payload = jwt.verify(token, JWT_SECRET) as { case_id: string }
        if (payload.case_id !== caseId) {
            return { error: 'Session does not match this case.' }
        }
    } catch {
        return { error: 'Session expired or invalid.' }
    }

    // 2. List and delete all storage files for this case
    const { data: files } = await supabaseAdmin.storage
        .from('evidence')
        .list(caseId)

    if (files && files.length > 0) {
        const paths = files.map((f) => `${caseId}/${f.name}`)
        await supabaseAdmin.storage.from('evidence').remove(paths)
    }

    // 3. Delete the case row (evidence + ai_analysis rows cascade-delete via foreign keys)
    const { error: deleteError } = await supabaseAdmin
        .from('cases')
        .delete()
        .eq('case_id', caseId)

    if (deleteError) {
        return { error: 'Could not delete case. Please try again.' }
    }

    // 4. Clear the session cookie
    cookieStore.delete('sw_session')

    return { success: true }
}