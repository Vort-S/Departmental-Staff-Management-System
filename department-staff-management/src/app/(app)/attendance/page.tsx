import {and,eq,isNull} from "drizzle-orm";
import {db} from "@/db/client";
import {staff} from "@/db/schema";
import {requireUser} from "@/lib/session";
import {attendanceList} from "@/lib/operations-data";
import {PageHead,Panel,Table,Tag} from "@/components/ui";
import {ActionForm} from "@/components/ActionForm";
export default async function Attendance(){const u=await requireUser(),rows=await attendanceList(u),members=u.role==="ADMIN"?await db.select({id:staff.id,name:staff.fullName}).from(staff).where(and(eq(staff.departmentId,u.departmentId),isNull(staff.archivedAt))):[];return <><PageHead title="Attendance & duties" subtitle="Daily departmental attendance and assigned duties"/><Panel title="Attendance log"><Table headers={["Date","Staff","Status","Duty"]} rows={rows.map(r=>[r.date,r.name,<Tag key={r.id}>{r.status}</Tag>,r.duty||"—"])}/></Panel>{u.role==="ADMIN"&&<Panel title="Record attendance"><ActionForm variant="attendance" submitLabel="Save attendance" fields={[{name:"staffId",label:"Staff",type:"select",required:true,options:members.map(m=>({value:m.id,label:m.name}))},{name:"date",label:"Duty date",type:"date",required:true},{name:"status",label:"Status",type:"select",required:true,options:["PRESENT","ABSENT","ON_LEAVE","REMOTE","DUTY"].map(x=>({value:x,label:x}))},{name:"duty",label:"Duty / shift description",type:"textarea"}]}/></Panel>}</>}
