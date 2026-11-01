# Development roadmap and evidence

## Phase 1 — functional local foundation

- [x] Next.js App Router + TypeScript + Tailwind project and locked npm dependencies.
- [x] Synthetic-data demo sign-in, signed HttpOnly session, logout, persistence.
- [x] Supabase password-auth adapter, school membership resolution, RLS schema and private Storage reservation.
- [x] Dashboard with actual class/student/assignment/year counts.
- [x] School profile with SK, SJKC and SJKT options.
- [x] Academic years, morning/afternoon sessions and year-level classes.
- [x] Subject catalogue and teacher assignments.
- [x] Add/edit/archive students, internal identifiers, filters/search/name sorting.
- [x] Selection and bulk class changes; historical enrollments preserved.
- [x] Excel worksheet selection, column mapping, preview, validation, duplicate detection, add/update confirmation and summary.
- [x] Blank import rows skipped, blank required updates rejected, no silent deletion, Excel export.
- [x] Responsive desktop/mobile layout, light/dark theme, dialog keyboard focus/Escape handling.
- [x] Workbook inspected and original preserved; schema boundary for curriculum documented.
- [x] README, architecture, database and privacy/operational notes.
- [ ] Full English translation: dashboard, navigation, common controls and forms translated and browser-tested; some validation/operation messages remain in BM.
- [ ] Hosted Supabase validation: no project URL/key or teacher account configured in this instance.
- [ ] Refresh/recovery authentication flows; multi-teacher assignment-level permissions; production accessibility/security review.

### Checks run on 1 November 2026

- `npm ci --no-audit --no-fund`: passed from committed-style lockfile (changes are still uncommitted).
- `npm run lint`: passed with no warnings after configuration cleanup.
- `npm run typecheck`: passed.
- `npm test`: 14 tests passed: validation/Excel (9), real embedded PostgreSQL schema/RLS/transaction tests (5).
- `npm run build`: passed (final check repeated after component extraction).
- `npm run test:e2e`: Chromium browser workflow passed: invalid credentials, valid sign-in, dashboard, profile, class, subject, assignment, student create/edit, Excel upload/preview/import, archive, cross-school class rejection, mobile no-horizontal-overflow check, English dashboard/form switching, logout.
- Original workbook: `git diff --exit-code -- dskp-reference.xlsx` passed.

Playwright browser download was denied by network policy; existing system Chromium was used successfully. No network verification was disabled. Embedded PostgreSQL tests simulate Auth identity; hosted Supabase Auth, Storage and RLS remain unverified until configured. Demo tests create only fictional records. Screenshots are ignored test artifacts.

## Remaining phases (not started)

- [ ] Phase 2: full workbook profiling, reviewed DSKP import, immutable versions, browsing, SK/SP selection.
- [ ] Phase 3: configurable PBD structures and rapid TP entry/history/reports.
- [ ] Phase 4: curriculum-connected RPH/RPT, templates, reflections, export.
- [ ] Phase 5: configurable examination grading and headcount.
- [ ] Phase 6: PAJSK after verified official scoring rules.
- [ ] Phase 7: book tracking, observations and behaviour.
- [ ] Phase 8: optional, teacher-reviewed AI without identifying student data.
- [ ] Phase 9: security/performance review, backup recovery, retention/deletion/export tooling, monitoring and deployment.

Do not begin Phase 2 until remaining Phase 1 acceptance gaps are reviewed. No payments, public registration, government portal automation, generated curriculum or student mastery judgments have been implemented.
