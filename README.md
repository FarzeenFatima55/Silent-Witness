<div align="center">

# Silent Witness

**Anonymous evidence documentation and AI-assisted complaint drafting for cyber harassment victims in Pakistan.**

Built to help victims of online harassment organize evidence and prepare a complaint aligned with **PECA 2016** (Prevention of Electronic Crimes Act) — without requiring an account, a name, or any personal information up front.

</div>

---

## The Problem

Cyber harassment is widespread in Pakistan, but reporting it is hard:

- Victims often don't know **what counts as evidence** or **how to describe it in legal terms**.
- Filing a complaint with **NCCIA** (National Cyber Crime Investigation Agency) requires a formal written application, evidence copies, and CNIC — a process most victims don't know how to navigate.
- Many victims hesitate to come forward because reporting tools require **signup, personal information, or feel institutional and unsafe**.

**Silent Witness** removes that friction: no account, no name, no email — just a private case code, your evidence, and an AI-assisted draft to help you take the first step.

---

## Features

### Anonymous by Design
- No signup or login. A case is created with a unique, unguessable code (e.g. `SW-7X9K2M`) and an optional 4-digit PIN.
- Session access is handled via short-lived, `httpOnly` signed cookies — never exposed to client-side JavaScript.
- All case data is locked behind Postgres Row-Level Security; only server-side code with the service role can read or write case data.

### Secure Evidence Upload
- Upload screenshots, chat logs, or documents (PNG, JPG, WEBP, GIF, PDF, TXT — up to 50MB).
- Files are stored in a **private** Supabase Storage bucket — never publicly accessible.
- Evidence is only ever served via **short-lived signed URLs** (5-minute expiry), generated on demand.

### On-Device OCR
- Screenshots are processed client-side with **Tesseract.js** to extract message text automatically.
- Extracted text is shown in an editable box so the victim can correct or complete it before saving — the AI never sees anything the user hasn't reviewed.

### PII Redaction
- Before any text is sent to the AI provider, phone numbers, CNIC numbers, emails, and long numeric IDs are automatically redacted.
- This protects third-party personal data (e.g. a harasser's leaked number) from being sent to an external AI service unnecessarily.

### AI-Assisted Analysis
- Evidence is analyzed **in chronological order** to reconstruct a timeline of events, flagging gaps or escalating patterns.
- The AI suggests a possible **PECA 2016 category** and drafts a complaint paragraph — always as a **suggestion**, never a legal conclusion.
- Every AI output is clearly labeled as a **draft for human review** and includes a disclaimer that it is not legal advice.

### NCCIA-Aligned PDF Export
- Generates a print-ready complaint package modeled on NCCIA's actual filing requirements:
  - A written application with **blank fields** for name, address, CNIC, and contact (filled in by hand — never stored digitally, to preserve anonymity).
  - The AI-drafted incident description.
  - A documents checklist (CNIC copy, evidence copy).
  - An evidence index **with the actual screenshots embedded** as appendix pages, so the whole submission is a single self-contained file.

### Full Deletion, On Demand
- A "Delete Case" action permanently removes the case record, all evidence database rows, and all files in storage — no soft-delete, no residue.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14+ (App Router, Server Actions) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| Database | Supabase (PostgreSQL) with Row-Level Security |
| File Storage | Supabase Storage (private bucket, signed URLs) |
| OCR | Tesseract.js (client-side) |
| AI Provider | Groq (Llama 3.3 70B) |
| PDF Generation | jsPDF |
| Auth | Custom — anonymous case codes + JWT session cookies (no user accounts) |

---

## Security Architecture

Security was treated as a first-class design constraint, not an afterthought:

- **Row-Level Security (RLS)** is enabled on every table. No table grants direct client access — all reads/writes go through server-side Server Actions using the Supabase service role key.
- **`SECURITY DEFINER` Postgres functions** (`generate_case_code`, `hash_pin`, `verify_case_access`) handle sensitive operations server-side, with `search_path` explicitly pinned to prevent search-path injection.
- **PINs are hashed with bcrypt** (via `pgcrypto`) — never stored or compared in plaintext.
- **Session tokens are short-lived JWTs** stored in `httpOnly`, `Secure`, `SameSite=Strict` cookies — inaccessible to `document.cookie` or XSS.
- **Evidence files are never public.** The storage bucket is private; access is only via time-limited signed URLs generated per request after session verification.
- **PII redaction** runs on extracted message text before it is sent to any external AI API.
- **Case lookups reveal no information on failure** — an invalid code and an invalid PIN return the same generic error, preventing enumeration.

---

## Important Disclaimers

- Silent Witness is a **documentation and drafting aid**, not a law firm and not a substitute for legal advice.
- AI-generated suggestions (category, draft complaint) are explicitly framed as non-definitive and require human review before filing.
- Users are responsible for reviewing all AI-generated content, filling in their personal details by hand, and consulting a legal professional where appropriate before submitting to NCCIA.

---

## Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Groq](https://console.groq.com) API key

### 1. Clone and install

```bash
git clone https://github.com/FarzeenFatima55/Silent-Witness.git
cd Silent-Witness
npm install
```

### 2. Set up environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_publishable_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_secret_key
JWT_SECRET=a_long_random_string
GROQ_API_KEY=your_groq_api_key
```

### 3. Run the database migrations

In the Supabase SQL Editor, run the migration files in `supabase/migrations/` **in order**. This sets up:
- `cases`, `evidence`, and `ai_analysis` tables with RLS enabled
- The `pgcrypto` extension
- Helper functions: `generate_case_code`, `hash_pin`, `verify_case_access`

Then create a **private** storage bucket named `evidence` in the Supabase dashboard (Storage -> New Bucket -> Public toggle **off**).

### 4. Run the dev server

```bash
npm run dev
```

Visit `http://localhost:3000`.

---

## Project Structure

```
silent-witness/
├── app/
│   ├── page.tsx                     # Landing page
│   ├── create-case/                 # New case + PIN setup
│   ├── access-case/                 # Retrieve an existing case
│   └── case/[case_id]/
│       ├── page.tsx                 # Case dashboard (evidence, danger zone)
│       └── AIAnalysisSection.tsx    # AI analysis + PDF export UI
├── lib/
│   ├── actions/
│   │   ├── case.ts                  # createCase, retrieveCase, deleteCase, getCaseCode
│   │   ├── evidence.ts              # uploadEvidence, listEvidence, getEvidenceSignedUrl
│   │   └── analysis.ts              # analyzeCase, getLatestAnalysis
│   ├── supabase/
│   │   ├── client.ts                # Browser client (publishable key)
│   │   └── server.ts                # Server-only admin client (service role)
│   ├── pdf/
│   │   └── generateComplaintPdf.ts  # NCCIA-aligned PDF generation
│   └── utils/
│       └── redact.ts                # PII redaction before AI calls
└── supabase/
    └── migrations/                  # SQL schema, RLS policies, functions
```

---

## Roadmap

- [ ] Rate limiting on case retrieval attempts (brute-force protection)
- [ ] Server-side OCR fallback for low-quality images
- [ ] Multi-language support (Urdu)
- [ ] Lawyer/NGO handoff mode for assisted filing

---

## Contributing

This project was built for a hackathon under time constraints — issues and pull requests are welcome for anyone who wants to help harden it further, especially around rate limiting, accessibility, and OCR accuracy.

---

## License

MIT

---

<div align="center">
Built with the goal of making one hard moment a little bit easier.
</div>