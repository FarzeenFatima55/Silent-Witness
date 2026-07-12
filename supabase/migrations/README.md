# Supabase Migrations — Silent Witness

## Migration order

| File | Purpose |
|------|---------|
| `20260713000001_create_enums.sql` | Custom `ENUM` types (`case_status`, `evidence_platform`, `evidence_type`) |
| `20260713000002_create_cases_table.sql` | `cases` table + `updated_at` trigger + RLS |
| `20260713000003_create_evidence_and_analysis_tables.sql` | `evidence` + `ai_analysis` tables + RLS |
| `20260713000004_create_access_verification_function.sql` | `verify_case_access()` + `generate_case_code()` Postgres functions |
| `20260713000005_create_storage_bucket.sql` | Private `evidence` Storage bucket + object RLS |
| `20260713000099_rollback.sql` | Teardown (dev only — **never run on production**) |

---

## How to apply

### Option A — Supabase CLI (recommended)
```bash
# Link to your project once
supabase link --project-ref <YOUR_PROJECT_REF>

# Push all pending migrations
supabase db push
```

### Option B — Supabase Dashboard SQL editor
Run each `.sql` file in order through **Dashboard → SQL editor → New query**.

---

## Security model

```
Browser (anon / authenticated JWT)
         │
         │  ← RLS blocks all direct table/storage access
         │
Next.js API routes  (server-side, Node.js)
         │  ← Uses SUPABASE_SERVICE_ROLE_KEY
         │
         ├── calls verify_case_access(case_code, pin)
         │         └── returns case_id only if credentials match
         │
         ├── reads/writes tables via service role (bypasses RLS)
         │
         └── generates signed URLs for evidence files (300s expiry)
```

**Key design decisions:**

- **No `users` table.** Access is scoped entirely to `case_code` + optional PIN. No session, no JWT user claim.
- **`verify_case_access()` is `SECURITY DEFINER`.** It reads the `cases` table on behalf of the caller, but the caller only gets back `case_id`, `status`, and `has_pin` — never `pin_hash`.
- **PIN hashing.** The API layer must hash the PIN with bcrypt/argon2 *before* storing it. `verify_case_access()` uses `pgcrypto.crypt()` for bcrypt comparison.
- **Storage is 100% private.** No object is accessible via a public URL. All file delivery goes through server-generated signed URLs with a 5-minute expiry.
- **EXIF stripping** is done in the Next.js API route with `sharp` *before* upload — Supabase Storage does not strip metadata automatically.

---

## Required Supabase extensions

Enable these in **Dashboard → Database → Extensions** before running migrations:

| Extension | Reason |
|-----------|--------|
| `pgcrypto` | `crypt()` / `gen_salt()` for bcrypt PIN hashing comparison |
| `uuid-ossp` | Fallback for `gen_random_uuid()` (available by default in PG 13+) |

---

## Environment variables (add to `.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>      # safe to expose — RLS blocks everything
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>  # SECRET — server-side only, never expose to browser
```

> [!CAUTION]
> `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS entirely. Keep it strictly server-side (`SUPABASE_SERVICE_ROLE_KEY`, not `NEXT_PUBLIC_`). Never import it in any file under `app/` that could be bundled for the client.
