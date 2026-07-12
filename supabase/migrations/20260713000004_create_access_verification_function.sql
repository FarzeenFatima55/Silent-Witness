-- ============================================================
-- Migration: 20260713000004_create_access_verification_function
-- Purpose:   Server-side Postgres function to validate a
--            case_code + optional PIN without exposing the
--            pin_hash or any row data to the client.
--
--            Called from Next.js API routes using the SERVICE
--            ROLE key (never from the browser directly).
--
-- SECURITY NOTE:
--   This function uses SECURITY DEFINER so it can read the
--   cases table even though RLS blocks direct client access.
--   The caller must be a trusted server-side context.
--   Set search_path explicitly to prevent search-path injection.
-- ============================================================

CREATE OR REPLACE FUNCTION verify_case_access(
  p_case_code TEXT,
  p_pin       TEXT DEFAULT NULL  -- raw PIN from the user; NULL if no PIN set
)
RETURNS TABLE (
  case_id    UUID,
  status     case_status,
  has_pin    BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row cases%ROWTYPE;
BEGIN
  -- Look up the case by code
  SELECT *
    INTO v_row
    FROM cases
   WHERE cases.case_code = p_case_code
   LIMIT 1;

  -- Case not found → return empty result set (no information leakage)
  IF NOT FOUND THEN
    RETURN;
  END IF;

  -- PIN check
  IF v_row.pin_hash IS NOT NULL THEN
    -- Case has a PIN: caller must provide the correct raw PIN.
    -- We use pgcrypto's crypt() for bcrypt comparison.
    -- If pgcrypto is not available, swap for your hashing extension.
    IF p_pin IS NULL OR crypt(p_pin, v_row.pin_hash) <> v_row.pin_hash THEN
      -- Wrong or missing PIN → return empty (same as "not found")
      RETURN;
    END IF;
  END IF;

  -- Access granted: return safe subset of case metadata only.
  -- Never return pin_hash to the caller.
  RETURN QUERY
    SELECT
      v_row.case_id,
      v_row.status,
      (v_row.pin_hash IS NOT NULL)::BOOLEAN AS has_pin;
END;
$$;

-- Revoke public execute; only the service role (used by API routes) calls this.
REVOKE ALL ON FUNCTION verify_case_access(TEXT, TEXT) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION verify_case_access(TEXT, TEXT) TO service_role;


-- ============================================================
-- Helper: generate_case_code()
-- Generates a "SW-XXXXXXX" style code (7 alphanumeric chars,
-- uppercase, no ambiguous chars I/O/0/1) and guarantees
-- uniqueness by looping until a free code is found.
-- Called from your Next.js API route when creating a new case.
-- ============================================================

CREATE OR REPLACE FUNCTION generate_case_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  -- Character set: uppercase alphanumeric minus ambiguous I, O, 0, 1
  v_chars TEXT    := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v_code  TEXT;
  v_len   INT     := 7;
  v_found BOOLEAN := false;
  i       INT;
BEGIN
  WHILE NOT v_found LOOP
    v_code := 'SW-';
    FOR i IN 1..v_len LOOP
      v_code := v_code
             || substr(v_chars,
                       floor(random() * length(v_chars))::INT + 1,
                       1);
    END LOOP;

    -- Check uniqueness
    IF NOT EXISTS (SELECT 1 FROM cases WHERE case_code = v_code) THEN
      v_found := true;
    END IF;
  END LOOP;

  RETURN v_code;
END;
$$;

REVOKE ALL ON FUNCTION generate_case_code() FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION generate_case_code() TO service_role;
