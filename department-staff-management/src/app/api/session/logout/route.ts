import {NextRequest,NextResponse} from "next/server";
import {csrfForCurrentSession,clearSession,getUser} from "@/lib/session";
import {constantEquals} from "@/lib/security";
import {assertSameOrigin} from "@/lib/http";
import {audit} from "@/lib/audit";
export const runtime="nodejs";
export async function POST(req:NextRequest){try{await assertSameOrigin();const expected=await csrfForCurrentSession(),provided=req.headers.get("x-csrf-token");if(!expected||!provided||!constantEquals(expected,provided))return NextResponse.json({error:"Forbidden"},{status:403});const user=await getUser();if(!user)return NextResponse.json({error:"Unauthorized"},{status:401});await clearSession();await audit("LOGOUT",user.id,"auth");return NextResponse.json({ok:true},{headers:{"Cache-Control":"no-store"}})}catch{return NextResponse.json({error:"Forbidden"},{status:403})}}
