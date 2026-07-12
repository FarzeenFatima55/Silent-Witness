-- ============================================================
-- Migration: 20260713000000_extensions
-- Purpose:   Enable required Postgres extensions.
--            Must run FIRST — subsequent migrations depend on these.
--
-- Extensions needed:
--   pgcrypto  → crypt() / gen_salt() for bcrypt PIN hashing in
--               verify_case_access(); also provides gen_random_uuid()
--               as a fallback for PG < 13.
--
-- In Supabase, extensions are enabled per-database. Using
-- IF NOT EXISTS makes this idempotent (safe to re-run).
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto
  WITH SCHEMA extensions;  -- Supabase convention: extensions live in the
                            -- "extensions" schema, not public

-- Verify gen_random_uuid() is available (works on PG 13+ natively;
-- pgcrypto also registers it in the extensions schema as a fallback).
-- This DO block will raise an exception and abort the migration if
-- UUID generation is broken, catching the problem before any table
-- is created.
DO $$
BEGIN
  PERFORM gen_random_uuid();
  RAISE NOTICE 'gen_random_uuid() is available — OK';
EXCEPTION
  WHEN undefined_function THEN
    RAISE EXCEPTION
      'gen_random_uuid() is not available. '
      'Enable pgcrypto or upgrade to PostgreSQL 13+.';
END;
$$;
