# RuangGuru

Phase 1 of a Malaysian primary-school teacher workspace. Next.js App Router, TypeScript, Tailwind, Radix/shadcn-style Button primitive, React Hook Form, TanStack Table, Zod, ExcelJS and Supabase.

## Run locally

Node 24 and npm 11 were tested.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

The explicit `APP_MODE=demo` setting enables synthetic, file-persisted development data. Sign in with `demo@guru.local` / `DemoGuru2026!`. Never enter actual pupil information in demo mode. Its shared records persist in `.data/demo.json`; stop the server and remove that file to reset synthetic records. The session signing key is locally generated and ignored by Git. Start the server again for each new session; processes do not survive snapshots.

Implemented workflows: dashboard; school profile (SK/SJKC/SJKT); academic years and morning/afternoon sessions; classes; subjects and teacher assignments; student search, name sorting, filters, selection, class bulk changes, edits and archival; Excel preview/import/export. Moving a student preserves earlier enrollments. Overall PBD is not calculated or implemented.

### Student Excel import

Use an `.xlsx` file up to 5 MB and 1,000 data rows. The first row contains column labels. Choose a worksheet, name column, internal ID column, destination class and add/update mode. Preview and fix errors before confirming. IDs are case-insensitive within a school. Duplicate IDs are rejected. Blank names/IDs are rejected, never applied as destructive updates. Entirely blank rows are skipped. Updating existing students preserves status; changing destination class creates enrollment history. No import deletes students. Export the list to obtain a starting template.

## Supabase setup (real accounts)

1. Create a Supabase project. Disable public user signup in Auth settings.
2. Apply `supabase/schema.sql` once to a new database using the SQL editor.
3. Create a teacher account using the Supabase dashboard. Create a school row, then a membership row linking its ID to the teacher's Auth user ID. Do this through trusted administration, never from the browser. Roles are reserved for future expansion; this personal MVP gives its teacher school-wide record access.
4. Set `APP_MODE=supabase`, `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local` or deployment settings. The anon key is public by design; RLS is the authorization boundary. Never add a service-role key to this application.
5. Restart and sign in with the provisioned teacher. Add an academic year before creating a class. Then add subjects, assignments and students.

Supabase sessions currently expire after one hour and require signing in again (no refresh flow). HTTPS is required for production cookies. No public signup or payments. Private Storage bucket is reserved with no access policies; file attachments are deferred.

## Validation

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Browser tests use installed `/usr/bin/chromium` in this environment. Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` on other machines, or install Playwright Chromium and adjust the executable path. Tests create synthetic records in demo storage. Unit/integration tests use embedded PostgreSQL (PGlite) with a simulated Auth identity to exercise real SQL/RLS. They do not establish hosted Supabase readiness.

## Scope and status

See `PROGRESS.md` for verified results and remaining gaps, `ARCHITECTURE.md`, `DATABASE.md`, and `docs/WORKBOOK.md`. Phase 2 is intentionally not started. Interface defaults to BM; the English toggle covers dashboard, navigation, common controls and forms; some validation/operation messages remain in BM.
