import Workspace from '@/components/workspace';
import { demo } from '@/lib/server';
export const dynamic='force-dynamic';
export default function Page(){return <Workspace demo={demo}/>;}
