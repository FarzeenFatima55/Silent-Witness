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