-- ============================================================
-- Migration: 20260713000003_create_evidence_and_analysis_tables
-- Purpose:   Evidence file records and AI analysis output.
--            Both reference cases(case_id) but no users table.
-- ============================================================

-- ── evidence ──────────────────────────────────────────────────────────────

CREATE TABLE evidence (
  evidence_id     UUID              PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Which case this evidence belongs to.
  -- ON DELETE CASCADE: deleting a case wipes all its evidence records.
  case_id         UUID              NOT NULL
                    REFERENCES cases (case_id) ON DELETE CASCADE,

  -- Supabase Storage object path, e.g. "evidence/<case_id>/<evidence_id>.jpg"
  -- This is the internal storage path, NOT a public URL.
  -- Signed URLs (5-minute expiry) are generated server-side on demand.
  file_url        TEXT              NOT NULL,

  -- Which platform the evidence originates from
  platform        evidence_platform NOT NULL DEFAULT 'other',

  -- Type of evidence file
  evidence_type   evidence_type     NOT NULL DEFAULT 'screenshot',

  -- User-supplied timestamp: when the harassment incident occurred.
  -- Nullable: user may not know exact time.
  captured_at     TIMESTAMPTZ       DEFAULT NULL,

  created_at      TIMESTAMPTZ       NOT NULL DEFAULT now()
);

-- Fast lookup of all evidence for a case
CREATE INDEX idx_evidence_case_id ON evidence (case_id);

-- ── Row Level Security ─────────────────────────────────────────────────────
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "evidence_deny_all_direct_client_access"
  ON evidence
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);


-- ── ai_analysis ───────────────────────────────────────────────────────────

CREATE TABLE ai_analysis (
  analysis_id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Each analysis belongs to exactly one case.
  -- ON DELETE CASCADE: deleting a case removes its analysis.
  case_id                 UUID        NOT NULL
                            REFERENCES cases (case_id) ON DELETE CASCADE,

  -- The PECA 2016 category Claude suggests (e.g. "Section 24 — Cyber Stalking")
  category_suggestion     TEXT        DEFAULT NULL,

  -- Claude's self-reported confidence as a float in [0.0, 1.0].
  -- NULL until analysis is complete.
  confidence_score        FLOAT       DEFAULT NULL
                            CHECK (confidence_score IS NULL
                                   OR (confidence_score >= 0.0
                                       AND confidence_score <= 1.0)),

  -- Structured list of key evidence points extracted by the AI.
  -- Stored as a JSONB array so it can be queried and indexed if needed.
  -- Example: [{"type":"screenshot","note":"Threat message on 2024-03-01"}]
  key_evidence_points     JSONB       NOT NULL DEFAULT '[]'::jsonb,

  -- The full AI-generated complaint draft in plain text.
  -- Always labelled as a draft in the UI — never presented as legal advice.
  draft_complaint_text    TEXT        DEFAULT NULL,

  -- Flipped to true once the user has opened and read the draft.
  reviewed_by_user        BOOLEAN     NOT NULL DEFAULT false,

  created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- A case can have at most one current analysis (enforced at application level);
-- the index also speeds up case_id lookups.
CREATE INDEX idx_ai_analysis_case_id ON ai_analysis (case_id);

-- ── Row Level Security ─────────────────────────────────────────────────────
ALTER TABLE ai_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_analysis_deny_all_direct_client_access"
  ON ai_analysis
  FOR ALL
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);
