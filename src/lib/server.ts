import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { mkdir, readFile, writeFile, rename } from 'node:fs/promises';
import path from 'node:path';
import { seed,SCHOOL,TEACHER } from './seed';
import type { Data } from './model';
export const demo=process.env.APP_MODE==='demo'||(!process.env.APP_MODE&&process.env.NODE_ENV!=='production');
const dir=path.join(process.cwd(),'.data');
export function client(token?:string){const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;if(!url||!key)throw Error('Supabase configuration missing');return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false},global:token?{headers:{Authorization:`Bearer ${token}`}}:undefined});}
async function secret(){await mkdir(dir,{recursive:true});try{await writeFile(path.join(dir,'session-key'),randomBytes(32).toString('hex'),{flag:'wx',mode:0o600});}catch(e){if((e as NodeJS.ErrnoException).code!=='EEXIST')throw e;}return readFile(path.join(dir,'session-key'),'utf8');}
export async function demoToken(){const payload=String(Date.now()+8*60*60*1000);return `${payload}.${createHmac('sha256',await secret()).update(payload).digest('hex')}`;}
export async function identity(){const token=(await cookies()).get('teacher_session')?.value;if(!token)throw Error('UNAUTHORIZED');
 if(demo){const [expires,signature]=token.split('.');const expected=createHmac('sha256',await secret()).update(expires||'').digest('hex');if(!signature||signature.length!==expected.length||!timingSafeEqual(Buffer.from(signature),Buffer.from(expected))||Number(expires)<Date.now())throw Error('UNAUTHORIZED');return {schoolId:SCHOOL,userId:TEACHER,db:null};}
 const db=client(token);const {data:{user},error}=await db.auth.getUser(token);if(error||!user)throw Error('UNAUTHORIZED');const {data:membership,error:memberError}=await db.from('memberships').select('school_id').eq('user_id',user.id).single();if(memberError||!membership)throw Error('FORBIDDEN');return {schoolId:membership.school_id as string,userId:user.id,db};
}
export async function readDemo():Promise<Data>{await mkdir(dir,{recursive:true});try{return JSON.parse(await readFile(path.join(dir,'demo.json'),'utf8'));}catch(e){if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;const data=seed();await saveDemo(data);return data;}}
export async function saveDemo(data:Data){const temp=path.join(dir,'demo.json.tmp');await writeFile(temp,JSON.stringify(data),{mode:0o600});await rename(temp,path.join(dir,'demo.json'));}
let queue=Promise.resolve();
export function serial<T>(fn:()=>Promise<T>):Promise<T>{const result=queue.then(fn);queue=result.then(()=>{},()=>{});return result;}
export async function loadData(auth:Awaited<ReturnType<typeof identity>>):Promise<Data>{if(!auth.db)return readDemo();const names=['schools','academic_years','classes','subjects','assignments','students','enrollments'] as const;const results=await Promise.all(names.map(n=>auth.db!.from(n).select('*')));for(const r of results)if(r.error)throw r.error;return {school:results[0].data![0],academic_years:results[1].data!,classes:results[2].data!,subjects:results[3].data!,assignments:results[4].data!,students:results[5].data!,enrollments:results[6].data!};}
export function sameOrigin(req:Request){const origin=req.headers.get('origin');return !!origin&&new URL(origin).host===req.headers.get('host');}
