import {NextRequest,NextResponse} from "next/server";
import {getUser} from "@/lib/session";
import {exportSchema} from "@/lib/validators";
import {staffDirectory} from "@/lib/staff-data";
import {assignments,leaveList,publicationList} from "@/lib/operations-data";
import {csvLine} from "@/lib/rules";
import {audit} from "@/lib/audit";
import {db} from "@/db/client";
import {and,eq,isNull,asc} from "drizzle-orm";
import {staff} from "@/db/schema";
import {publicColumns} from "@/lib/staff-data";
export const runtime="nodejs";export const dynamic="force-dynamic";
export async function GET(_request:NextRequest,{params}:{params:Promise<{kind:string}>}){const u=await getUser();if(!u||!(["ADMIN","HOD"].includes(u.role)))return NextResponse.json({error:"Forbidden"},{status:403});const p=exportSchema.safeParse(await params);if(!p.success)return NextResponse.json({error:"Invalid report"},{status:400});const {kind}=p.data;let lines:unknown[][]=[];
 if(kind==="staff"){const records=await db.select(publicColumns).from(staff).where(and(eq(staff.departmentId,u.departmentId),isNull(staff.archivedAt))).orderBy(asc(staff.staffId));lines=[["Staff ID","Full name","Rank","Type","Status","Unit","Public email"],...records.map(r=>[r.staffId,r.fullName,r.rank,r.staffType,r.status,r.unit,r.publicEmail])];}
 else if(kind==="courses"){const r=await assignments(u);lines=[["Course","Title","Units","Staff","Session"],...r.map(x=>[x.code,x.title,x.units,x.staffName,x.session])];}
 else if(kind==="leave"){const r=await leaveList(u);lines=[["Staff","Type","Start","End","Status"],...r.map(x=>[x.staffName,x.type,x.startDate,x.endDate,x.status])];}
 else{const r=await publicationList(u);lines=[["Staff","Type","Title","Year"],...r.map(x=>[x.name,x.category,x.title,x.year])];}
 await audit("REPORT_EXPORTED",u.id,"report",kind,{rows:lines.length-1});const body="\uFEFF"+lines.map(csvLine).join("");return new NextResponse(body,{status:200,headers:{"Content-Type":"text/csv; charset=utf-8","Content-Disposition":`attachment; filename="department-${kind}.csv"`,"Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}});
}
