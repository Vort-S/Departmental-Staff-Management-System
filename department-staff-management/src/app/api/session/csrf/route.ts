import {NextResponse} from "next/server";
import {csrfForCurrentSession} from "@/lib/session";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function GET(){const csrf=await csrfForCurrentSession();if(!csrf)return NextResponse.json({error:"Unauthorized"},{status:401});return NextResponse.json({csrf},{headers:{"Cache-Control":"private, no-store"}})}
