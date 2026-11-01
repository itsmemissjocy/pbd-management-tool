import { NextResponse } from 'next/server';
import { client,demo,demoToken,sameOrigin } from '@/lib/server';
export async function POST(req:Request){if(!sameOrigin(req))return NextResponse.json({error:'Forbidden'},{status:403});try{const {email,password,logout}=await req.json();if(logout){const res=NextResponse.json({ok:true});res.cookies.delete('teacher_session');return res;}let token:string;
 if(demo){if(email!=='demo@guru.local'||password!=='DemoGuru2026!')return NextResponse.json({error:'E-mel atau kata laluan tidak sah'},{status:401});token=await demoToken();}else{const {data,error}=await client().auth.signInWithPassword({email,password});if(error||!data.session)return NextResponse.json({error:'E-mel atau kata laluan tidak sah'},{status:401});token=data.session.access_token;}
 const res=NextResponse.json({ok:true});res.cookies.set('teacher_session',token,{httpOnly:true,sameSite:'strict',secure:process.env.NODE_ENV==='production',path:'/',maxAge:demo?28800:3600});return res;
 }catch{return NextResponse.json({error:'Tidak dapat log masuk. Semak konfigurasi pelayan.'},{status:400});}}
