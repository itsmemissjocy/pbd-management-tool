# Database

Apply `supabase/schema.sql` to a new Supabase project. This is a first schema, not an idempotent migration for an existing installation.

| Entity | Purpose / constraints |
|---|---|
| schools | School tenant, name, SK/SJKC/SJKT, optional code |
| memberships | One school per teacher in personal MVP; protected Auth user mapping, future roles |
| academic_years | School-scoped calendar year and Pagi/Petang session |
| classes | Year level 1–6 and academic year; composite tenant foreign key |
| subjects | School-scoped subject catalogue |
| assignments | Teacher/class/subject mapping; same-school references |
| students | UUID, internal code, name, active/archived; no national ID required |
| enrollments | Student/class history; one current enrollment, previous rows ended |
| audit_logs | Tenant, authenticated actor, entity ID, action and timestamp |

Students' subject enrollments are derived from current class assignments for Phase 1. Optional subject-specific enrollments are future work. Assessment history will reference enrollment/student IDs rather than overwrite yearly records. Tenant tables have RLS and tenant columns cannot be reassigned by app mutations. Anonymous users have no table grants. Members cannot change their membership or role. The school teacher may currently manage all school records; role-specific and assigned-class access will precede multi-teacher release.

`save_students` is security-invoker and transactional. A foreign-school student/class combination fails composite foreign-key checks even if an attacker bypasses the API. RLS blocks reads and writes outside `current_school()`. Metadata-only audit triggers run as definer with a fixed search path.

## Reserved Phase 2 architecture (not implemented)

- curriculum_sources: original file name, SHA-256, storage object, import timestamp and provenance.
- curriculum_versions: source ID, version label, review status; immutable imports.
- school_types, curriculum_subjects, year_levels: reference dictionaries, separate from teacher assignments.
- themes and topics: version/school-type/subject/year hierarchy, exact original text.
- content_standards: topic ID, original SK wording, optional parsed code.
- learning_standards: content standard ID, original SP wording, optional parsed code.
- source_locations: source/version, worksheet, row, source cell mapping; provenance for each imported entity.
- optional_translations: separate, reviewed text; never replace Chinese or other official original wording.

Unknown school type must remain unknown pending review, never defaulted to SK. Future imports produce a new version and preview differences; duplicate fingerprints prompt review and never silently overwrite approved standards. Future RPH/PBD should reference immutable standard IDs and retain snapshots for historical documents.
