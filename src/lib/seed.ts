import type { Data } from './model';
export const SCHOOL='00000000-0000-4000-8000-000000000001';
export const TEACHER='00000000-0000-4000-8000-000000000002';
export function seed():Data {
 const year='00000000-0000-4000-8000-000000000003';
 const c1='00000000-0000-4000-8000-000000000004';
 const subject='00000000-0000-4000-8000-000000000005';
 const students=['Aina Contoh','Daniel Contoh','Mei Ling Contoh','Arun Contoh','Sofia Contoh','Hakim Contoh'].map((name,i)=>({id:`00000000-0000-4000-8000-${String(i+10).padStart(12,'0')}`,school_id:SCHOOL,name,student_code:`DEMO-${i+1}`,status:'active' as const}));
 return {school:{id:SCHOOL,name:'Sekolah Demonstrasi Harmoni',type:'SK',code:'DEMO'},academic_years:[{id:year,school_id:SCHOOL,label:'2026',session:'Pagi'}],classes:[{id:c1,school_id:SCHOOL,name:'5 Amanah',year_level:5,academic_year_id:year}],subjects:[{id:subject,school_id:SCHOOL,name:'Bahasa Melayu'}],assignments:[{id:'00000000-0000-4000-8000-000000000006',school_id:SCHOOL,class_id:c1,subject_id:subject,teacher_id:TEACHER}],students,enrollments:students.map((s,i)=>({id:`00000000-0000-4000-8000-${String(i+30).padStart(12,'0')}`,school_id:SCHOOL,student_id:s.id,class_id:c1,ended_at:null}))};
}
