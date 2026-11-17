import {and,eq,isNull} from "drizzle-orm";
import {db} from "@/db/client";
import {staff} from "@/db/schema";
import {requireUser} from "@/lib/session";
import {appraisalList} from "@/lib/operations-data";
import {PageHead,Panel,Table,Tag} from "@/components/ui";
import {ActionForm} from "@/components/ActionForm";
export default async function Appraisals(){const u=await requireUser(),rows=await appraisalList(u),members=u.role==="HOD"?await db.select({id:staff.id,name:staff.fullName,userId:staff.userId}).from(staff).where(and(eq(staff.departmentId,u.departmentId),isNull(staff.archivedAt))):[];return <><PageHead title="Performance appraisals" subtitle="Confidential, read-only assessments for staff · HOD-controlled entry"/><Panel title={u.role==="STAFF"?"My appraisals":"Department appraisals"}><Table headers={["Staff","Period","Rating","Notes"]} rows={rows.map(r=>[r.name,r.period,<Tag key={r.id}>{r.rating} / 5</Tag>,<div key={r.id} className="prose-content min-w-56">{r.notes}</div>])}/></Panel>{u.role==="HOD"&&<Panel title="Record a new appraisal"><ActionForm variant="appraisal" submitLabel="Save appraisal" fields={[{name:"staffId",label:"Staff member",type:"select",required:true,options:members.filter(m=>m.userId!==u.id).map(m=>({value:m.id,label:m.name}))},{name:"period",label:"Appraisal period",placeholder:"2026-1",required:true},{name:"rating",label:"Rating (1–5)",type:"number",required:true},{name:"notes",label:"Appraisal comments",type:"textarea",required:true}]}/></Panel>}</>}
