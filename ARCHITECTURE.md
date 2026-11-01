# Architecture

App Router serves a client workspace and two server-only APIs. `/api/auth` calls Supabase password authentication and stores its access token in a Secure (production), HttpOnly, SameSite=Strict cookie. `/api/data` verifies the user with `getUser` on every request and resolves the school from a non-writable membership. Zod validates inputs, relations are checked against visible school records, and PostgreSQL RLS is independently applied. Mutations enforce same-origin requests. No service-role credentials are required.

The explicit synthetic demo adapter uses the same validation/data model, HMAC-signed expiring cookies, and a local ignored JSON file. Writes are serialized and committed by atomic rename in a single Node process. It is for local exploration, not production concurrency, multi-instance deployment or real pupils.

React Hook Form handles editing; a Radix Slot-based shadcn-style Button provides reusable composition. TanStack Table supports name sorting and compact student rows; filters and bulk class updates operate on IDs. ExcelJS parses workbooks in the browser; validated records are revalidated on the server. Supabase's invoker-security `save_students` RPC applies student and enrollment changes atomically. Unique indexes, RLS and composite foreign keys protect against races and cross-school links. Live data reloads after each successful write. Multi-editor stale update detection remains a production-readiness task.

Curriculum integration is reserved at the model boundary described in DATABASE.md; no official standards are synthesized or imported. Recharts, TanStack Virtual, AI and paid subscriptions are deferred until their phases need them.

## Privacy and operations

Use synthetic data in development. Demo data is shared across demo sessions and intentionally has known credentials. Never expose demo mode publicly with actual school records. Audit logs contain identifiers/action/time, not student names or row snapshots. RLS separates schools; assignment-level restrictions within a school are a rollout gate before multiple teachers. Membership provisioning and role escalation require trusted administration.

Before production: security review, login abuse controls beyond provider defaults, password recovery, session refresh, account deletion/export tooling, retention schedules approved by the school, encrypted backups with restore drills, observability and accessibility audit. No account deletion UI yet: an authorized operator must export school records and follow an approved retention/deletion plan. Student archival preserves history rather than destroying records. Database backup should use Supabase's supported backup/PITR plan plus restricted, encrypted exports with tested recovery. No backup or hosted deployment has been performed by this change.
