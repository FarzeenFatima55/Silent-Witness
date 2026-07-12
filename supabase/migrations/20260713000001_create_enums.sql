-- ============================================================
-- Migration: 20260713000001_create_enums
-- Purpose:   Define all custom enum types used across the schema.
--            Run before the table migrations.
-- ============================================================

-- Case lifecycle status
CREATE TYPE case_status AS ENUM (
  'draft',      -- evidence uploaded, no AI analysis yet
  'reviewed',   -- AI analysis complete, user has seen the draft
  'exported'    -- user has exported the PDF complaint
);

-- Social/messaging platforms evidence may originate from
CREATE TYPE evidence_platform AS ENUM (
  'whatsapp',
  'instagram',
  'facebook',
  'other'
);

-- The kind of file attached as evidence
CREATE TYPE evidence_type AS ENUM (
  'screenshot',
  'text_log',
  'other'
);
