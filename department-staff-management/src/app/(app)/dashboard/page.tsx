import Link from "next/link";
import {ArrowRight,UserRoundPlus,ClipboardList,BookOpen,CheckCircle2,CalendarDays,ShieldCheck} from "lucide-react";
import {and,eq,isNull,isNotNull,count,sql,lte,gte} from "drizzle-orm";
import {db} from "@/db/client";
import {staff,leaveRequests,courseAssignments,users} from "@/db/schema";
import {requireUser,myStaff} from "@/lib/session";
import {noticeList,assignments,leaveList,balance,auditList} from "@/lib/operations-data";
import {isManager} from "@/lib/rules";
import {PageHead,Panel,Stat,Table,Tag,formatDate} from "@/components/ui";
export default async function Dashboard(){const u=await requireUser(),manager=isManager(u),me=await myStaff(u.id);const announcements=await noticeList(u);
 if(!manager){const myAssignments=(await assignments(u)).filter(a=>a.staffId===me?.id),myRequests=await leaveList(u),bal=me?await balance(me.id):null;
 const filled=me?[me.fullName,me.specialization,me.qualifications,me.officeLocation,me.phone,me.photoUrl].filter(Boolean).length:0;return <><PageHead title="My workspace" subtitle="Your courses, leave requests and staff profile."/><div className="grid md:grid-cols-3 gap-4 mb-6"><Stat label="Profile completion" value={`${Math.round(filled/6*100)}%`} hint="Complete your profile to improve directory accuracy"/><Stat label="Assigned courses" value={myAssignments.length} hint="Across all sessions"/><Stat label="Annual leave remaining" value={bal?.remaining??"—"} hint="Calendar days in this year"/></div><div className="grid lg:grid-cols-2 gap-5"><Panel title="My teaching load"><p className="text-sm muted mb-4">Course units: <b>{myAssignments.reduce((n,a)=>n+a.units,0)}</b></p><Table headers={["Code","Course","Session"]} rows={myAssignments.slice(0,6).map(x=>[x.code,x.title,x.session])}/><Link href="/courses" className="text-sm text-[var(--color-accent)] mt-4 block">View all courses →</Link></Panel><Panel title="My recent leave"><Table headers={["Type","Dates","Status"]} rows={myRequests.slice(0,5).map(x=>[x.type,`${x.startDate} — ${x.endDate}`,<Tag key={x.id}>{x.status}</Tag>])}/><Link className="text-sm text-[var(--color-accent)] mt-4 block" href="/leave">Manage leave requests →</Link></Panel></div><Panel title="Latest notices">{announcements.length===0&&<p className="muted text-sm py-4">No notices have been published.</p>}{announcements.slice(0,4).map(a=><article key={a.id} className="border-b last:border-0 py-3"><h3 className="font-semibold">{a.title}</h3><p className="text-sm muted mt-1 prose-content line-clamp-2">{a.body}</p></article>)}</Panel></>}
 const now=new Date(),day=now.getUTCDay(),monday=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate()-((day+6)%7))),sunday=new Date(monday.getTime()+6*86400_000);
 const startWeek=monday.toISOString().slice(0,10),endWeek=sunday.toISOString().slice(0,10);
 const [countRows,types,statRows,rankRows,pending,assigned,onLeave]=await Promise.all([
 db.select({total:count()}).from(staff).where(and(eq(staff.departmentId,u.departmentId),isNull(staff.archivedAt))),
 db.select({type:staff.staffType,total:count()}).from(staff).where(and(eq(staff.departmentId,u.departmentId),isNull(staff.archivedAt))).groupBy(staff.staffType),
 db.select({status:staff.status,total:count()}).from(staff).where(and(eq(staff.departmentId,u.departmentId),isNull(staff.archivedAt))).groupBy(staff.status),
 db.select({rank:staff.rank,total:count()}).from(staff).where(and(eq(staff.departmentId,u.departmentId),isNull(staff.archivedAt))).groupBy(staff.rank),
 db.select({total:count()}).from(leaveRequests).innerJoin(staff,eq(leaveRequests.staffId,staff.id)).where(and(eq(staff.departmentId,u.departmentId),eq(leaveRequests.status,"PENDING"))),
 db.select({total:count()}).from(courseAssignments).innerJoin(staff,eq(courseAssignments.staffId,staff.id)).where(eq(staff.departmentId,u.departmentId)),
 db.select({total:sql<number>`count(distinct ${staff.id})::int`}).from(leaveRequests).innerJoin(staff,eq(leaveRequests.staffId,staff.id)).where(and(eq(staff.departmentId,u.departmentId),eq(leaveRequests.status,"APPROVED"),lte(leaveRequests.startDate,endWeek),gte(leaveRequests.endDate,startWeek),isNull(staff.archivedAt)))
 ]);

 const leaves=(await leaveList(u)).filter(l=>l.status==="PENDING").slice(0,5);
 const audit=u.role==="ADMIN"?await auditList(u):[];
 const waitingAccounts=u.role==="ADMIN"?(await db.select({total:count()}).from(users).where(and(eq(users.departmentId,u.departmentId),eq(users.status,"PENDING"),isNotNull(users.emailVerifiedAt))))[0]?.total??0:0;
 const pendingLeaveCount=pending[0]?.total??0;
 const needsAttention=waitingAccounts>0||(u.role==="HOD"&&pendingLeaveCount>0);
 return <>
  <section className="dashboard-intro dashboard-welcome mb-6 flex flex-wrap items-center justify-between gap-5 px-6 py-7 sm:px-8 sm:py-9" aria-labelledby="dashboard-title">
    <div className="max-w-2xl">
      <h1 id="dashboard-title" className="page-title">Department overview</h1>
      <p className="mt-2 text-sm sm:text-base text-[var(--color-muted)]">Review staff, teaching and outstanding requests at a glance.</p>
    </div>
    <Link href={u.role==="ADMIN"?"/admin":"/leave"} className="btn btn-large">
      {u.role==="ADMIN"?"Review accounts":"Review leave"} <ArrowRight size={17} aria-hidden="true"/>
    </Link>
  </section>
  <div className="dashboard-priority-grid mb-6">
    <section className="card dashboard-priority p-5 sm:p-6" aria-labelledby="attention-heading">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div><h2 id="attention-heading" className="section-title">Needs attention</h2><p className="muted text-sm mt-1">Requests currently awaiting a decision.</p></div>
        <span className="priority-icon" aria-hidden="true"><ClipboardList size={21}/></span>
      </div>
      {needsAttention?<div className="space-y-2.5">
        {u.role==="ADMIN"&&waitingAccounts>0&&<Link href="/admin" className="priority-action group">
          <span className="priority-count">{waitingAccounts}</span>
          <span className="min-w-0 flex-1"><strong className="block text-sm">Verified accounts awaiting approval</strong><span className="muted text-xs mt-1 block">Review staff registrations</span></span>
          <ArrowRight size={18} className="text-[var(--color-accent)] transition-transform group-hover:translate-x-0.5" aria-hidden="true"/>
        </Link>}
        {u.role==="HOD"&&pendingLeaveCount>0&&<Link href="/leave" className="priority-action group">
          <span className="priority-count">{pendingLeaveCount}</span>
          <span className="min-w-0 flex-1"><strong className="block text-sm">Leave requests awaiting review</strong><span className="muted text-xs mt-1 block">Approve or decline pending requests</span></span>
          <ArrowRight size={18} className="text-[var(--color-accent)]" aria-hidden="true"/>
        </Link>}
      </div>:<div className="dashboard-caught-up">
        <CheckCircle2 size={24} className="text-[var(--color-success)] shrink-0" aria-hidden="true"/>
        <div><p className="font-semibold text-sm">All caught up</p><p className="muted text-sm mt-1">No {u.role==="ADMIN"?"verified accounts are awaiting approval":"leave requests are awaiting your decision"}.</p></div>
      </div>}
      {u.role==="ADMIN"&&pendingLeaveCount>0&&<p className="mt-4 text-sm muted">{pendingLeaveCount} leave {pendingLeaveCount===1?"request is":"requests are"} awaiting the Head of Department&apos;s decision.</p>}
    </section>
    <section className="card p-5 sm:p-6" aria-labelledby="quick-actions-heading">
      <h2 id="quick-actions-heading" className="section-title mb-1">Quick actions</h2>
      <p className="muted text-sm mb-4">Common departmental tasks.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-2">
        <Link className="dashboard-quick-link" href="/staff"><UserRoundPlus size={18} aria-hidden="true"/><span>{u.role==="ADMIN"?"Manage staff records":"View staff directory"}</span><ArrowRight size={16} className="ml-auto" aria-hidden="true"/></Link>
        <Link className="dashboard-quick-link" href="/courses"><BookOpen size={18} aria-hidden="true"/><span>Course allocation</span><ArrowRight size={16} className="ml-auto" aria-hidden="true"/></Link>
        <Link className="dashboard-quick-link" href="/leave"><CalendarDays size={18} aria-hidden="true"/><span>Leave management</span><ArrowRight size={16} className="ml-auto" aria-hidden="true"/></Link>
        {u.role==="ADMIN"&&<Link className="dashboard-quick-link" href="/reports"><ShieldCheck size={18} aria-hidden="true"/><span>Reports & oversight</span><ArrowRight size={16} className="ml-auto" aria-hidden="true"/></Link>}
      </div>
    </section>
  </div>
  <section aria-label="Department statistics" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
    <Stat label="Total staff" value={countRows[0]?.total??0}/>
    <Stat label="Pending leave" value={pendingLeaveCount}/>
    <Stat label="Course assignments" value={assigned[0]?.total??0}/>
    <Stat label="On leave this week" value={onLeave[0]?.total??0}/>
  </section>
  <div className="grid lg:grid-cols-2 gap-5">
    <Panel title="Staff composition">
      <div className="space-y-5">
        {types.length===0&&<div className="py-5">
          <p className="font-semibold text-sm">No staff records yet</p>
          <p className="muted text-sm mt-2">Add staff to see the department breakdown.</p>
          {u.role==="ADMIN"&&<Link href="/staff" className="text-sm text-[var(--color-accent)] font-semibold inline-flex items-center min-h-11 hover:underline mt-2">Open staff directory <ArrowRight size={15} aria-hidden="true" className="ml-1"/></Link>}
        </div>}
        {types.map(x=><div key={x.type}><div className="flex justify-between text-sm mb-2"><span>{x.type.replaceAll("_"," ")}</span><b className="tabular-nums">{x.total}</b></div><progress aria-label={`${x.type} staff distribution`} className="w-full h-3 accent-[var(--color-accent)]" value={x.total} max={Math.max(countRows[0]?.total??0,1)}/></div>)}
      </div>
      {rankRows.length>0&&<><h3 className="font-semibold mt-6 mb-3">Staff by rank</h3><div className="flex flex-wrap gap-2">{rankRows.map(r=><Tag key={r.rank}>{r.rank}: {r.total}</Tag>)}</div><h3 className="font-semibold mt-6 mb-3">Employment status</h3><div className="flex flex-wrap gap-2">{statRows.map(st=><Tag key={st.status}>{st.status}: {st.total}</Tag>)}</div></>}
    </Panel>
    <Panel title="Leave requests">
      <Table empty="No pending leave requests" headers={["Staff","Period","Status"]} rows={leaves.map(l=>[l.staffName,`${l.startDate} — ${l.endDate}`,<Tag key={l.id}>{l.status}</Tag>])}/>
      <Link href="/leave" className="text-sm font-semibold text-[var(--color-accent)] mt-4 inline-flex items-center min-h-11">View leave requests <ArrowRight size={15} className="ml-1" aria-hidden="true"/></Link>
    </Panel>
  </div>
  <div className="grid lg:grid-cols-2 gap-5">
    <Panel title="Latest announcements">
      {announcements.length===0&&<p className="muted text-sm py-4">No announcements have been published.</p>}
      {announcements.slice(0,4).map(a=><article key={a.id} className="border-b last:border-0 py-3"><h3 className="font-semibold">{a.title}</h3><p className="text-sm muted line-clamp-2 prose-content">{a.body}</p></article>)}
    </Panel>
    <Panel title={u.role==="ADMIN"?"Recent security activity":"Administrative tools"}>
      {u.role==="ADMIN"?<Table empty="No recent security events" headers={["Event","When"]} rows={audit.slice(0,7).map(a=>[a.event,formatDate(a.createdAt)])}/>:<div className="flex gap-3 flex-wrap"><Link className="btn btn-outline" href="/courses">Course allocation</Link><Link className="btn btn-outline" href="/reports">Export reports</Link></div>}
    </Panel>
  </div>
 </>;
}
