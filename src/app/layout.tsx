import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'RuangGuru · Pengurusan Guru',description:'Ruang kerja harian untuk guru sekolah rendah Malaysia'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="ms"><body>{children}</body></html>;}
