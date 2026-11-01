-- Apply once to a new Supabase project. No service-role key is used by the app.
create table public.schools (id uuid primary key default gen_random_uuid(), name text not null check(length(name) between 2 and 160), type text not null check(type in ('SK','SJKC','SJKT')), code text not null default '');
create table public.memberships (user_id uuid primary key references auth.users(id) on delete cascade, school_id uuid not null references schools(id), role text not null default 'teacher' check(role in ('teacher','class_teacher','school_admin')));
create table public.academic_years (id uuid primary key default gen_random_uuid(), school_id uuid not null references schools(id), label text not null check(label ~ '^20[0-9]{2}$'), session text not null check(session in ('Pagi','Petang')), unique(school_id,label,session), unique(id,school_id));
create table public.classes (id uuid primary key default gen_random_uuid(), school_id uuid not null references schools(id), name text not null, year_level int not null check(year_level between 1 and 6), academic_year_id uuid not null, foreign key(academic_year_id,school_id) references academic_years(id,school_id), unique(id,school_id), unique(school_id,academic_year_id,name));
create table public.subjects (id uuid primary key default gen_random_uuid(),school_id uuid not null references schools(id),name text not null,unique(school_id,name),unique(id,school_id));
create table public.assignments (id uuid primary key default gen_random_uuid(),school_id uuid not null references schools(id),teacher_id uuid not null references auth.users(id),class_id uuid not null,subject_id uuid not null,foreign key(class_id,school_id) references classes(id,school_id),foreign key(subject_id,school_id) references subjects(id,school_id),unique(school_id,teacher_id,class_id,subject_id));
create table public.students (id uuid primary key default gen_random_uuid(),school_id uuid not null references schools(id),name text not null check(length(name) between 2 and 160),student_code text not null check(length(student_code) between 1 and 40),status text not null default 'active' check(status in ('active','archived')),unique(id,school_id));
create unique index student_code_school on students(school_id,lower(student_code));
create table public.enrollments (id uuid primary key default gen_random_uuid(),school_id uuid not null references schools(id),student_id uuid not null,class_id uuid not null,ended_at timestamptz,foreign key(student_id,school_id) references students(id,school_id),foreign key(class_id,school_id) references classes(id,school_id));
create unique index one_current_enrollment on enrollments(student_id) where ended_at is null;
create table public.audit_logs (id bigint generated always as identity primary key,school_id uuid not null references schools(id),actor_id uuid references auth.users(id),table_name text not null,record_id uuid not null,action text not null,created_at timestamptz not null default now());
create function public.current_school() returns uuid language sql stable security definer set search_path=public as $$ select school_id from public.memberships where user_id=auth.uid() $$;
revoke all on function public.current_school() from public; grant execute on function public.current_school() to authenticated;
alter table memberships enable row level security;
create policy own_membership on memberships for select to authenticated using(user_id=auth.uid());
alter table schools enable row level security;
create policy school_read on schools for select to authenticated using(id=current_school());
create policy school_edit on schools for update to authenticated using(id=current_school()) with check(id=current_school());
do $$ declare t text; begin foreach t in array array['academic_years','classes','subjects','assignments','students','enrollments'] loop execute format('alter table %I enable row level security',t); execute format('create policy tenant_select on %I for select to authenticated using(school_id=public.current_school())',t); execute format('create policy tenant_insert on %I for insert to authenticated with check(school_id=public.current_school())',t); execute format('create policy tenant_update on %I for update to authenticated using(school_id=public.current_school()) with check(school_id=public.current_school())',t); end loop; end $$;
-- Personal MVP: one teacher owns the school's records. Assignment-based access is a future rollout gate.
create policy own_assignment_insert on assignments as restrictive for insert to authenticated with check(teacher_id=auth.uid());
create policy own_assignment_update on assignments as restrictive for update to authenticated using(teacher_id=auth.uid()) with check(teacher_id=auth.uid());
alter table audit_logs enable row level security;
create policy audit_read on audit_logs for select to authenticated using(school_id=current_school());
create function public.audit_change() returns trigger language plpgsql security definer set search_path=public as $$ begin insert into audit_logs(school_id,actor_id,table_name,record_id,action) values (case when TG_TABLE_NAME='schools' then NEW.id else (to_jsonb(NEW)->>'school_id')::uuid end,auth.uid(),TG_TABLE_NAME,NEW.id,TG_OP); return NEW; end $$;
revoke all on function public.audit_change() from public;
do $$ declare t text; begin foreach t in array array['schools','academic_years','classes','subjects','assignments','students','enrollments'] loop execute format('create trigger audit_write after insert or update on %I for each row execute function public.audit_change()',t); end loop; end $$;
-- Invoker security preserves RLS; the whole import rolls back on any constraint failure.
create function public.save_students(records jsonb,new_enrollments jsonb,ended_ids uuid[]) returns void language plpgsql security invoker set search_path=public as $$
begin
 if jsonb_array_length(records)>1000 then raise exception 'Import limit exceeded'; end if;
 insert into students(id,school_id,name,student_code,status) select x.id,x.school_id,x.name,x.student_code,x.status from jsonb_to_recordset(records) as x(id uuid,school_id uuid,name text,student_code text,status text) on conflict(id) do update set name=excluded.name,student_code=excluded.student_code,status=excluded.status;
 update enrollments set ended_at=now() where id=any(ended_ids);
 insert into enrollments(id,school_id,student_id,class_id) select x.id,x.school_id,x.student_id,x.class_id from jsonb_to_recordset(new_enrollments) as x(id uuid,school_id uuid,student_id uuid,class_id uuid);
end $$;
revoke all on function public.save_students(jsonb,jsonb,uuid[]) from public; grant execute on function public.save_students(jsonb,jsonb,uuid[]) to authenticated;
-- Storage: private bucket reserved for later evidence; no client access until a reviewed policy exists.
insert into storage.buckets(id,name,public) values('teacher-private','teacher-private',false) on conflict(id) do nothing;

revoke all on all tables in schema public from anon;
grant select,update on schools to authenticated;
grant select on memberships,audit_logs to authenticated;
grant select,insert,update on academic_years,classes,subjects,assignments,students,enrollments to authenticated;
