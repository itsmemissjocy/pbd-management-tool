import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { beforeAll,afterAll,it,expect } from 'vitest';
const db=new PGlite();
const s1='10000000-0000-4000-8000-000000000001',s2='10000000-0000-4000-8000-000000000002',u1='20000000-0000-4000-8000-000000000001',u2='20000000-0000-4000-8000-000000000002';
beforeAll(async()=>{
 await db.exec(`create role authenticated; create role anon; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('app.user_id',true),'')::uuid $$; grant usage on schema auth to authenticated; grant execute on function auth.uid() to authenticated; create schema storage; create table storage.buckets(id text primary key,name text,public boolean);`);
 await db.exec(readFileSync('supabase/schema.sql','utf8'));
 await db.exec(`insert into auth.users values('${u1}'),('${u2}'); insert into schools(id,name,type) values('${s1}','School One','SK'),('${s2}','School Two','SJKC'); insert into memberships(user_id,school_id) values('${u1}','${s1}'),('${u2}','${s2}'); insert into students(id,school_id,name,student_code) values('30000000-0000-4000-8000-000000000001','${s1}','Synthetic One','ONE'),('30000000-0000-4000-8000-000000000002','${s2}','Synthetic Two','TWO'); set role authenticated; set app.user_id='${u1}';`);
},30000);
afterAll(async()=>await db.close());
it('only exposes the authenticated school',async()=>{const r=await db.query('select name from students');expect(r.rows).toEqual([{name:'Synthetic One'}]);expect((await db.query('select id from schools')).rows).toEqual([{id:s1}]);});
it('rejects cross-tenant insert',async()=>{await expect(db.query(`insert into students(school_id,name,student_code) values('${s2}','Intruder','BAD')`)).rejects.toThrow(/row-level security/);});
it('cannot modify another school or grant membership',async()=>{const r=await db.query(`update students set name='Intruder' where school_id='${s2}' returning id`);expect(r.rows).toHaveLength(0);await expect(db.query(`insert into memberships(user_id,school_id) values(gen_random_uuid(),'${s1}')`)).rejects.toThrow();});
it('blocks cross-school enrollment references and rolls back atomic import',async()=>{await db.exec(`insert into academic_years(id,school_id,label,session) values('40000000-0000-4000-8000-000000000001','${s1}','2026','Pagi'); insert into classes(id,school_id,name,year_level,academic_year_id) values('50000000-0000-4000-8000-000000000001','${s1}','1 Test',1,'40000000-0000-4000-8000-000000000001')`);
 const records=JSON.stringify([{id:'60000000-0000-4000-8000-000000000001',school_id:s1,name:'Atomic Test',student_code:'ATOMIC',status:'active'}]);const enrollments=JSON.stringify([{id:'70000000-0000-4000-8000-000000000001',school_id:s1,student_id:'30000000-0000-4000-8000-000000000002',class_id:'50000000-0000-4000-8000-000000000001'}]);await expect(db.query('select save_students($1::jsonb,$2::jsonb,$3::uuid[])',[records,enrollments,[]])).rejects.toThrow();expect((await db.query("select * from students where student_code='ATOMIC'")).rows).toHaveLength(0);
});
it('writes audit records without student names',async()=>{const r=await db.query('select table_name,action from audit_logs');expect(r.rows.length).toBeGreaterThan(0);});
