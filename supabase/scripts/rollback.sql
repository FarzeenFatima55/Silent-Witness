-- ============================================================
-- Script: rollback.sql
-- Location: supabase/scripts/rollback.sql
--
-- Purpose:   Tears down everything created by migrations
--            000000–000005, in reverse dependency order.
--
-- USE WITH CAUTION — this is destructive and irreversible.
-- Intended for local dev resets only. Never run on production.
--
-- How to run locally (Supabase CLI):
--   npx supabase db reset
--   (resets and re-applies all migrations from scratch)
--
-- Or run manually in the SQL editor for targeted teardown.
--
-- Covers:
--   000005 — storage bucket + RLS policy
--   000004 — verify_case_access(), generate_case_code()
--   000003 — ai_analysis, evidence tables
--   000002 — cases table + set_updated_at() trigger/function
--   000001 — enum types
--   000000 — pgcrypto extension
-- ============================================================

-- Storage: policy first, then bucket (avoids orphaned policies)
DROP POLICY IF EXISTS "evidence_bucket_deny_all_direct_client_access"
  ON storage.objects;

-- NOTE: Supabase does not allow direct DELETE on storage.buckets.
-- Delete the bucket via: Dashboard > Storage > evidence > Delete bucket
-- OR via the Supabase Management API / Storage API.

-- Functions (drop before tables to avoid stale references)
DROP FUNCTION IF EXISTS generate_case_code()           CASCADE;
DROP FUNCTION IF EXISTS verify_case_access(TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS set_updated_at()               CASCADE;

-- Tables (reverse FK order: dependents before parents)
DROP TABLE IF EXISTS ai_analysis CASCADE;
DROP TABLE IF EXISTS evidence     CASCADE;
DROP TABLE IF EXISTS cases        CASCADE;

-- Enum types (must come after tables that reference them)
DROP TYPE IF EXISTS evidence_type     CASCADE;
DROP TYPE IF EXISTS evidence_platform CASCADE;
DROP TYPE IF EXISTS case_status       CASCADE;

-- Extension (last — only safe to drop if nothing depends on it)
-- Commented out by default: dropping pgcrypto may break other things
-- if the database is shared. Uncomment only for a full wipe.
-- DROP EXTENSION IF EXISTS pgcrypto CASCADE;
