-- ============================================================
-- Migration: 20260713000005_create_storage_bucket
-- Purpose:   Configure the private Supabase Storage bucket for
--            evidence files.
--
-- NOTE: Supabase Storage bucket creation is NOT done via SQL in
-- most Supabase projects — it's done via the Dashboard or the
-- Management API. This file contains:
--
--   1. The SQL to insert the bucket record directly into
--      storage.buckets (works if you have storage schema access).
--   2. The storage RLS policies to lock down object access.
--
-- If you are using `supabase db push` or the hosted Dashboard,
-- run Section A via Dashboard > Storage > New Bucket, then
-- apply the RLS policies in Section B via the SQL editor.
-- ============================================================


-- ── Section A: Bucket definition ──────────────────────────────────────────
--
-- Creates a PRIVATE bucket called "evidence".
-- public = false  →  no object is ever publicly accessible.
-- Signed URLs (generated server-side, 5-minute expiry) are the
-- only way to retrieve a file.
--
-- If this migration errors because storage.buckets already exists
-- or you don't have storage schema access, create the bucket
-- manually in the Supabase Dashboard with:
--   Name:   evidence
--   Public: OFF (private)

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'evidence',               -- bucket id (used in storage paths)
  'evidence',               -- display name
  false,                    -- PRIVATE: never publicly accessible
  10485760,                 -- 10 MB per file limit
  ARRAY[                    -- accept screenshots and text exports only
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'text/plain',
    'application/pdf'
  ]
)
ON CONFLICT (id) DO NOTHING;


-- ── Section B: Storage object RLS policies ────────────────────────────────
--
-- These policies run on storage.objects (the individual files).
-- The bucket is private, so without an explicit policy,
-- nobody can read or write files at all.
--
-- Policy design:
--   - anon / authenticated roles: DENIED for everything.
--   - service_role: implicitly bypasses RLS (Supabase default).
--     Server-side API routes use the service role to:
--       • Upload evidence files after verifying case access.
--       • Generate short-lived signed URLs (createSignedUrl, 300s).
--       • Delete files when a user requests case deletion.
--
-- This means the browser NEVER touches Storage directly.
-- All storage operations are proxied through the Next.js API.

CREATE POLICY "evidence_bucket_deny_all_direct_client_access"
  ON storage.objects
  FOR ALL
  TO anon, authenticated
  USING (bucket_id = 'evidence' AND false)
  WITH CHECK (bucket_id = 'evidence' AND false);


-- ── Section C: Application usage notes (comments only) ───────────────────
--
-- In your Next.js API route (using the service role client):
--
--   // Upload:
--   const { data, error } = await supabaseAdmin.storage
--     .from('evidence')
--     .upload(`${caseId}/${evidenceId}.jpg`, fileBuffer, {
--       contentType: 'image/jpeg',
--       upsert: false,
--     });
--
--   // Generate a 5-minute signed URL for client preview:
--   const { data: signedUrl } = await supabaseAdmin.storage
--     .from('evidence')
--     .createSignedUrl(`${caseId}/${evidenceId}.jpg`, 300); // 300 seconds
--
--   // Delete all files for a case:
--   const { data: list } = await supabaseAdmin.storage
--     .from('evidence')
--     .list(caseId);
--   await supabaseAdmin.storage
--     .from('evidence')
--     .remove(list.map(f => `${caseId}/${f.name}`));
--
-- EXIF stripping must be done in the API route BEFORE upload
-- (e.g. using the `sharp` npm package) since Supabase Storage
-- does not strip metadata automatically.
