import {requireRole} from "@/lib/session";
import {adminAccounts} from "@/lib/staff-data";
import {auditList} from "@/lib/operations-data";
import {PageHead,Panel,Table,Tag,formatDate} from "@/components/ui";
import {ActionForm} from "@/components/ActionForm";
import {ActionButton} from "@/components/ActionButtons";

export default async function Admin(){
 const u=await requireRole(["ADMIN"]);
 const [accounts,logs]=await Promise.all([adminAccounts(u),auditList(u)]);
 const pending=accounts.filter(a=>a.status==="PENDING");
 const ready=pending.filter(a=>a.emailVerifiedAt);
 const active=accounts.filter(a=>a.status==="ACTIVE");
 const verified=accounts.filter(a=>a.emailVerifiedAt);
 return <>
  <PageHead title="Account management" subtitle="Review access requests and manage departmental accounts."/>
  <section className="admin-summary" aria-label="Account statistics">
    <div className="admin-summary-item"><p className="muted text-sm font-medium">Awaiting approval</p><p>{ready.length}</p></div>
    <div className="admin-summary-item"><p className="muted text-sm font-medium">Active accounts</p><p>{active.length}</p></div>
    <div className="admin-summary-item"><p className="muted text-sm font-medium">Verified emails</p><p>{verified.length}</p></div>
  </section>
  <Panel title="Pending registration" subtitle="Verify each request before granting access.">
   {pending.length===0?<div className="dashboard-caught-up"><p className="font-semibold text-sm">No registrations waiting for review.</p></div>:
    <Table headers={["Account","Verification","Role","Review"]} empty="No registrations waiting for review" rows={pending.map(a=>[
     <div key={a.id}><p className="font-semibold break-all">{a.email}</p><p className="muted text-xs mt-1">{a.requestedStaffId||"No staff ID"}</p></div>,
     <span key={a.id} className={a.emailVerifiedAt?"text-[var(--color-success)] font-semibold":"muted"}>{a.emailVerifiedAt?"Verified":"Awaiting verification"}</span>,
     <Tag key={a.id}>{a.role}</Tag>,
     a.emailVerifiedAt?<ActionButton key={a.id} kind="approveUser" id={a.id} label="Approve account"/>:<span key={a.id} className="muted text-sm">Not ready</span>
    ])}/>}
  </Panel>
  <Panel title="Staff account access" subtitle="Manage existing roles and account status.">
    <Table headers={["Account","Role","Status","Manage"]} empty="No existing staff accounts" rows={accounts.filter(a=>a.status!=="PENDING").map(a=>[
     <div key={a.id}><p className="font-semibold break-all">{a.email}</p><p className="muted text-xs mt-1">{a.requestedStaffId||"—"}</p></div>,
     <Tag key={a.id}>{a.role}</Tag>,
     <Tag key={a.id}>{a.status}</Tag>,
     a.id===u.id?<span key={a.id} className="muted text-xs">Current account</span>:<div key={a.id} className="flex flex-wrap gap-2">
       {a.status==="ACTIVE"&&<ActionButton kind="suspendUser" id={a.id} label="Suspend"/>}
       {a.status==="ACTIVE"&&a.role!=="HOD"&&<ActionButton kind="role" id={a.id} role="HOD" label="Make HOD"/>}
       {a.status==="ACTIVE"&&a.role!=="STAFF"&&<ActionButton kind="role" id={a.id} role="STAFF" label="Make staff"/>}
     </div>
    ])}/>
  </Panel>
  <Panel title="Invite staff" subtitle="Send an invitation to a departmental email address.">
    <ActionForm variant="invite" submitLabel="Send invitation" fields={[{name:"email",label:"Email address",type:"email",required:true},{name:"role",label:"Assigned role",type:"select",required:true,options:[{value:"STAFF",label:"Staff"},{value:"HOD",label:"Head of department"}]}]}/>
  </Panel>
  <Panel title="Recent security activity">
    <Table empty="No security events recorded" headers={["Event","Record","Date","IP fingerprint"]} rows={logs.map(a=>[a.event,`${a.entity??"—"} ${a.entityId?.slice(0,8)??""}`,formatDate(a.createdAt),<code key={a.createdAt.toString()} className="text-xs">{a.ipHash?.slice(0,10)??"—"}</code>])}/>
  </Panel>
 </>;
}
