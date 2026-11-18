"use client";
import {useEffect,useState,useTransition} from "react";
import Link from "next/link";
import {usePathname,useRouter} from "next/navigation";
import {LayoutDashboard,Users,BookOpen,CalendarDays,ClipboardCheck,FileCheck2,GraduationCap,Star,Megaphone,FileDown,ShieldCheck,FlaskConical,NotebookPen,Settings,Menu,X,LogOut,UserRound,LockKeyhole,LoaderCircle,Building2} from "lucide-react";
import {logout} from "@/actions/auth";

type Role = "ADMIN" | "HOD" | "STAFF";
const items = [
  {href:"/dashboard",text:"Dashboard",icon:LayoutDashboard},
  {href:"/profile",text:"My profile",icon:UserRound},
  {href:"/staff",text:"Staff directory",icon:Users},
  {href:"/courses",text:"Courses & load",icon:BookOpen},
  {href:"/leave",text:"Leave requests",icon:CalendarDays},
  {href:"/attendance",text:"Attendance",icon:ClipboardCheck},
  {href:"/documents",text:"Documents",icon:FileCheck2},
  {href:"/publications",text:"Publications",icon:GraduationCap},
  {href:"/appraisals",text:"Appraisals",icon:Star},
  {href:"/announcements",text:"Announcements",icon:Megaphone},
  {href:"/reports",text:"Reports",icon:FileDown,roles:["ADMIN","HOD"]},
  {href:"/admin",text:"Administration",icon:Settings,roles:["ADMIN"]}
];
const resources = [
  {href:"/security",text:"Security",icon:ShieldCheck},
  {href:"/testing",text:"Testing",icon:FlaskConical},
  {href:"/review",text:"Project review",icon:NotebookPen},
  {href:"/change-password",text:"Change password",icon:LockKeyhole}
];

export function Nav({role,email}:{role:Role,email:string}) {
  const [open,setOpen] = useState(false);
  const [signingOut,startSignOut] = useTransition();
  const path = usePathname();
  const router = useRouter();
  useEffect(()=>{setOpen(false)},[path]);
  useEffect(()=>{
    if(!open)return;
    const closeOnEscape=(event:KeyboardEvent)=>{if(event.key==="Escape")setOpen(false)};
    window.addEventListener("keydown",closeOnEscape);
    return ()=>window.removeEventListener("keydown",closeOnEscape);
  },[open]);
  const active=(href:string)=>path===href||path.startsWith(href+"/");
  const navItem=(item:{href:string,text:string,icon:typeof LayoutDashboard})=>{
    const Icon=item.icon;
    return <Link onClick={()=>setOpen(false)} key={item.href} href={item.href} aria-current={active(item.href)?"page":undefined}
      className={`nav-link flex gap-3 items-center rounded-[var(--radius-control)] px-3.5 py-2 text-sm font-medium ${active(item.href)?"nav-active":""}`}>
      <Icon size={18} strokeWidth={1.9} aria-hidden="true" className="shrink-0"/>{item.text}
    </Link>;
  };
  return <>
    <div className="mobile-head">
      <Link className="inline-flex items-center gap-2 font-bold text-[var(--color-text)] tracking-tight" href="/dashboard"><span className="brand-mark !w-8 !h-8"><Building2 size={17} aria-hidden="true"/></span>DSMS</Link>
      <button className="inline-flex w-11 h-11 items-center justify-center rounded-[var(--radius-control)] text-[var(--color-text)] hover:bg-[var(--color-surface-soft)]" type="button" aria-label={open?"Close navigation menu":"Open navigation menu"} aria-expanded={open} aria-controls="sidebar-navigation" onClick={()=>setOpen(v=>!v)}>
        {open?<X size={22} aria-hidden="true"/>:<Menu size={22} aria-hidden="true"/>}
      </button>
    </div>
    {open&&<button type="button" aria-label="Close navigation menu" className="mobile-menu-overlay" onClick={()=>setOpen(false)}/>}
    <aside id="sidebar-navigation" className={`sidebar ${open?"sidebar-open":""}`} aria-label="Department navigation">
      <div className="px-5 pt-7 pb-5 border-b border-white/15">
        <Link href="/dashboard" onClick={()=>setOpen(false)} className="inline-flex items-center gap-2.5 text-xl font-extrabold tracking-tight text-white hover:text-white"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15"><Building2 size={20} aria-hidden="true"/></span>DSMS</Link>
        <div className="mt-5 rounded-[var(--radius-control)] bg-white/10 px-3.5 py-3.5 text-xs">
          <p className="font-bold text-white">{role==="HOD"?"Head of department":role==="ADMIN"?"Administrator":"Staff"}</p>
          <p className="text-white/80 truncate mt-1" title={email}>{email}</p>
        </div>
      </div>
      <nav className="px-3 py-4" aria-label="Primary">
        <div className="space-y-1">{items.filter(i=>!i.roles||i.roles.includes(role)).map(navItem)}</div>
        <p className="px-3.5 pt-6 pb-2 text-[11px] font-semibold tracking-wide uppercase text-white/65">Account & project</p>
        <div className="space-y-1">{resources.map(navItem)}</div>
        <button type="button" disabled={signingOut} aria-busy={signingOut} onClick={()=>startSignOut(async()=>{try{await logout();router.push("/login");router.refresh();}catch{/* The server retains the session; allow a retry. */}})}
          className="nav-signout nav-link w-full flex gap-3 items-center rounded-[var(--radius-control)] px-3.5 py-2 text-sm font-medium text-left">
          {signingOut?<LoaderCircle size={18} className="animate-spin shrink-0" aria-hidden="true"/>:<LogOut size={18} strokeWidth={1.9} className="shrink-0" aria-hidden="true"/>}
          {signingOut?"Signing out…":"Sign out"}
        </button>
      </nav>
    </aside>
  </>;
}
