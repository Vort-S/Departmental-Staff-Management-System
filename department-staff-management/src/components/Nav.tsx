"use client";
import {useEffect,useState,useTransition} from "react";
import Link from "next/link";
import {usePathname,useRouter} from "next/navigation";
import {LayoutDashboard,Users,BookOpen,CalendarDays,ClipboardCheck,FileCheck2,GraduationCap,Star,Megaphone,FileDown,ShieldCheck,FlaskConical,NotebookPen,Settings,ChevronDown,Menu,X,LogOut,UserRound,LockKeyhole,LoaderCircle} from "lucide-react";
import {logout} from "@/actions/auth";
import {BrigBrand} from "@/components/BrigLogo";

type Role = "ADMIN" | "HOD" | "STAFF";
type NavItem={href:string,text:string,icon:typeof LayoutDashboard,roles?:Role[]};
const groups:{title:string,items:NavItem[]}[]=[
  {title:"Workspace",items:[
    {href:"/dashboard",text:"Overview",icon:LayoutDashboard},
    {href:"/staff",text:"Staff directory",icon:Users},
    {href:"/profile",text:"My profile",icon:UserRound}
  ]},
  {title:"Academic work",items:[
    {href:"/courses",text:"Courses & load",icon:BookOpen},
    {href:"/publications",text:"Publications",icon:GraduationCap},
    {href:"/appraisals",text:"Appraisals",icon:Star}
  ]},
  {title:"Operations",items:[
    {href:"/leave",text:"Leave requests",icon:CalendarDays},
    {href:"/attendance",text:"Attendance",icon:ClipboardCheck},
    {href:"/documents",text:"Documents",icon:FileCheck2},
    {href:"/announcements",text:"Announcements",icon:Megaphone}
  ]},
  {title:"Management",items:[
    {href:"/reports",text:"Reports",icon:FileDown,roles:["ADMIN","HOD"]},
    {href:"/admin",text:"Administration",icon:Settings,roles:["ADMIN"]}
  ]}
];
const accountItems:NavItem[]=[{href:"/change-password",text:"Change password",icon:LockKeyhole}];
const projectItems:NavItem[]=[
  {href:"/security",text:"Security",icon:ShieldCheck},
  {href:"/testing",text:"Testing",icon:FlaskConical},
  {href:"/review",text:"Project review",icon:NotebookPen}
];

export function Nav({role,email}:{role:Role,email:string}) {
  const [open,setOpen] = useState(false);
  const [signOutError,setSignOutError] = useState("");
  const [signingOut,startSignOut] = useTransition();
  const path = usePathname();
  const router = useRouter();
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
      <Link className="inline-flex items-center gap-2 font-bold text-[var(--color-text)] tracking-tight" href="/dashboard"><BrigBrand compact/></Link>
      <button className="inline-flex w-11 h-11 items-center justify-center rounded-[var(--radius-control)] text-[var(--color-text)] hover:bg-[var(--color-surface-soft)]" type="button" aria-label={open?"Close navigation menu":"Open navigation menu"} aria-expanded={open} aria-controls="sidebar-navigation" onClick={()=>setOpen(v=>!v)}>
        {open?<X size={22} aria-hidden="true"/>:<Menu size={22} aria-hidden="true"/>}
      </button>
    </div>
    {open&&<button type="button" aria-label="Close navigation menu" className="mobile-menu-overlay" onClick={()=>setOpen(false)}/>}
    <aside id="sidebar-navigation" className={`sidebar ${open?"sidebar-open":""}`} aria-label="Department navigation">
      <div className="px-5 pt-7 pb-5 border-b border-white/15">
        <Link href="/dashboard" onClick={()=>setOpen(false)} className="inline-flex items-center gap-2.5 text-white hover:text-white"><BrigBrand inverse/></Link>
        <div className="mt-1 ml-[52px] text-[10px] tracking-[.08em] text-[#D3C1A1] font-semibold uppercase">Department workspace</div>
        <div className="mt-5 rounded-[var(--radius-control)] bg-white/10 px-3.5 py-3.5 text-xs">
          <p className="font-bold text-white">{role==="HOD"?"Head of department":role==="ADMIN"?"Administrator":"Staff"}</p>
          <p className="text-white/80 truncate mt-1" title={email}>{email}</p>
        </div>
      </div>
      <nav className="px-3 py-4" aria-label="Primary">
        {groups.map(group=>{
          const visible=group.items.filter(item=>!item.roles||item.roles.includes(role));
          if(!visible.length)return null;
          return <div key={group.title} className="mb-4">
            <h2 className="sidebar-group-heading">{group.title}</h2>
            <div className="space-y-0.5">{visible.map(navItem)}</div>
          </div>;
        })}
        <div className="mt-5 pt-3 border-t border-white/15">
          <h2 className="sidebar-group-heading">Your account</h2>
          <div className="space-y-0.5">{accountItems.map(navItem)}</div>
          <details className="sidebar-resources group mt-2" open={projectItems.some(item=>active(item.href))||undefined}>
            <summary className="nav-link flex items-center justify-between gap-2 rounded-[var(--radius-control)] px-3.5 py-3 text-sm font-medium cursor-pointer">
              Project information <ChevronDown size={16} className="shrink-0 transition-transform group-open:rotate-180" aria-hidden="true"/>
            </summary>
            <div className="mt-1 ml-2 pl-2 border-l border-white/20 space-y-0.5">{projectItems.map(navItem)}</div>
          </details>
        </div>
        {signOutError&&<p role="alert" className="mx-3 mt-3 text-sm text-[#ffdde1]">{signOutError}</p>}
        <button type="button" disabled={signingOut} aria-busy={signingOut}
          onClick={()=>{setSignOutError("");startSignOut(async()=>{try{await logout();router.push("/login");router.refresh();}catch{setSignOutError("Sign out failed. Please try again.");}});}}
          className="nav-signout nav-link w-full flex gap-3 items-center rounded-[var(--radius-control)] px-3.5 py-2 text-sm font-medium text-left mt-2">
          {signingOut?<LoaderCircle size={18} className="animate-spin shrink-0" aria-hidden="true"/>:<LogOut size={18} strokeWidth={1.9} className="shrink-0" aria-hidden="true"/>}
          {signingOut?"Signing out…":"Sign out"}
        </button>
      </nav>
    </aside>
  </>;
}
