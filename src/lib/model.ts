import { z } from 'zod';
export const schoolSchema=z.object({name:z.string().trim().min(2).max(160),type:z.enum(['SK','SJKC','SJKT']),code:z.string().trim().max(30)});
export const yearSchema=z.object({label:z.string().regex(/^20\d{2}$/),session:z.enum(['Pagi','Petang'])});
export const classSchema=z.object({name:z.string().trim().min(1).max(60),year_level:z.coerce.number().int().min(1).max(6),academic_year_id:z.string().uuid()});
export const subjectSchema=z.object({name:z.string().trim().min(2).max(100)});
export const assignmentSchema=z.object({class_id:z.string().uuid(),subject_id:z.string().uuid()});
export const studentSchema=z.object({name:z.string().trim().min(2).max(160),student_code:z.string().trim().min(1).max(40),class_id:z.string().uuid(),status:z.enum(['active','archived']).default('active')});
export type School=z.infer<typeof schoolSchema>&{id:string};
export type Year=z.infer<typeof yearSchema>&{id:string;school_id:string};
export type Class=z.infer<typeof classSchema>&{id:string;school_id:string};
export type Subject=z.infer<typeof subjectSchema>&{id:string;school_id:string};
export type Assignment=z.infer<typeof assignmentSchema>&{id:string;school_id:string;teacher_id:string};
export type Student={id:string;school_id:string;name:string;student_code:string;status:'active'|'archived'};
export type Enrollment={id:string;school_id:string;student_id:string;class_id:string;ended_at:string|null};
export type Data={school:School;academic_years:Year[];classes:Class[];subjects:Subject[];assignments:Assignment[];students:Student[];enrollments:Enrollment[]};
export type ImportRow={row:number;name:string;student_code:string;error?:string};
export function validateImport(rows:ImportRow[],existing:Student[],mode:'add'|'update') {
 const seen=new Set<string>();
 return rows.map(r=>{let error='';if(!r.name.trim()||!r.student_code.trim())error='Nama dan ID diperlukan';
 if(r.name.length>160||r.student_code.length>40)error='Teks terlalu panjang';
 const key=r.student_code.toLowerCase();if(seen.has(key))error='ID berulang dalam fail';seen.add(key);
 const found=existing.some(s=>s.student_code.toLowerCase()===key);
 if(mode==='add'&&found)error='ID sudah wujud';
 if(mode==='update'&&!found)error='ID tidak ditemui';
 return {...r,error:error||undefined};});
}
