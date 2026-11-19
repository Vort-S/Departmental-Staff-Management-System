export const dynamic="force-dynamic";
import Link from "next/link";
import type {Metadata} from "next";
import {ArrowRight,BookOpen,CalendarDays,ClipboardCheck,FileText,Search,ShieldCheck,Users,CheckCircle2,GraduationCap,UserCheck,LockKeyhole} from "lucide-react";
import {CampusPhoto} from "@/components/CampusPhoto";
import {BrigBrand} from "@/components/BrigLogo";

export const metadata:Metadata={alternates:{canonical:"/"}};

const features=[
 {number:"01",icon:Users,title:"People & records",detail:"Keep staff profiles, appointments and departmental details accessible to the people who need them."},
 {number:"02",icon:BookOpen,title:"Teaching allocation",detail:"Know which courses are assigned, to whom, and for which academic session."},
 {number:"03",icon:CalendarDays,title:"Leave & attendance",detail:"Submit requests, record decisions and keep staff availability visible."},
 {number:"04",icon:ClipboardCheck,title:"Department activity",detail:"Publish notices, record appraisals and review administrative changes."}
];
const roles=[
 {icon:ShieldCheck,title:"Administrators",text:"Approve accounts, manage roles and maintain accurate staff records."},
 {icon:GraduationCap,title:"Heads of department",text:"Review leave, oversee teaching loads and keep departmental work moving."},
 {icon:Users,title:"Staff members",text:"Find your course assignments, request leave and keep your profile current."}
];
/** A schematic showing actual product workflows without posing fictional records as live data. */
function WorkspacePreview(){
 return <div className="product-preview" aria-label="Illustration of Brig's department overview; no live account data">
   <div className="flex min-h-[292px]">
    <div className="preview-sidebar hidden sm:flex w-[126px] shrink-0 flex-col px-3 py-4 gap-3" aria-hidden="true">
     <span className="font-semibold text-sm text-[#F4E5C5]">Brig</span>
     <span className="rounded-md bg-white/15 px-2 py-2 text-[11px] font-medium">Overview</span>
     <span className="text-white/70 text-[11px] px-2">Staff</span><span className="text-white/70 text-[11px] px-2">Courses</span><span className="text-white/70 text-[11px] px-2">Leave</span>
    </div>
    <div className="min-w-0 flex-1 bg-[#FFFEFB] p-4 sm:p-5">
     <div className="flex items-center justify-between gap-2">
      <div><p className="text-[10px] tracking-wider uppercase font-semibold text-[var(--color-muted)]">Department workspace</p><p className="mt-1 font-bold text-sm sm:text-base">Overview</p></div>
      <span className="rounded-lg p-2 bg-[var(--color-accent-soft)] text-[var(--color-accent)]"><ClipboardCheck size={17} aria-hidden="true"/></span>
     </div>
     <div className="grid grid-cols-2 gap-2 mt-4">
      <div className="brig-mini-stat"><span className="text-[10px] font-semibold text-[var(--color-muted)]">Staff directory</span><div className="mt-2 flex items-center gap-2"><Users size={17} className="text-[var(--color-accent)]"/><span className="text-xs font-semibold">Records</span></div></div>
      <div className="brig-mini-stat"><span className="text-[10px] font-semibold text-[var(--color-muted)]">Teaching</span><div className="mt-2 flex items-center gap-2"><BookOpen size={17} className="text-[var(--color-accent)]"/><span className="text-xs font-semibold">Allocations</span></div></div>
     </div>
     <div className="mt-3 rounded-xl border border-[var(--color-border)] p-3">
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-[var(--color-border)]"><span className="font-semibold text-xs">Needs attention</span><span className="text-[10px] text-[var(--color-muted)]">Review queue</span></div>
      <div className="flex items-center gap-2 py-3 border-b border-[var(--color-border)]"><span className="p-1.5 rounded-lg bg-[var(--color-accent-soft)] text-[var(--color-accent)]"><UserCheck size={15}/></span><span className="text-[11px] flex-1 font-medium">Account approvals</span><ArrowRight size={14} className="text-[var(--color-accent)]"/></div>
      <div className="flex items-center gap-2 pt-3"><span className="p-1.5 rounded-lg bg-[var(--color-accent-soft)] text-[var(--color-accent)]"><CalendarDays size={15}/></span><span className="text-[11px] flex-1 font-medium">Leave requests</span><ArrowRight size={14} className="text-[var(--color-accent)]"/></div>
     </div>
    </div>
   </div>
 </div>;
}

export default function Home(){
 return <div className="min-h-screen flex flex-col">
  <header className="public-top">
   <div className="max-w-7xl mx-auto py-3 px-5 sm:px-8 flex items-center justify-between gap-4">
    <Link href="/" aria-label="Brig home" className="inline-flex hover:text-[var(--color-text)]"><BrigBrand/></Link>
    <nav aria-label="Public navigation" className="flex items-center gap-3 sm:gap-6 text-sm">
     <Link href="#features" className="hidden sm:inline font-semibold text-[var(--color-muted)] hover:text-[var(--color-text)]">Features</Link>
     <Link href="#roles" className="hidden md:inline font-semibold text-[var(--color-muted)] hover:text-[var(--color-text)]">Who it serves</Link>
     <Link href="/login" className="btn btn-outline">Sign in <ArrowRight size={16} aria-hidden="true"/></Link>
    </nav>
   </div>
  </header>
  <main id="main" className="flex-1">
   <section className="hero-section" aria-labelledby="hero-title">
    <div className="max-w-7xl mx-auto px-5 sm:px-8 grid lg:grid-cols-[.86fr_1.14fr] gap-12 lg:gap-14 items-center py-16 sm:py-20 lg:py-28">
     <div className="min-w-0">
      <span className="brand-kicker">Brig for universities</span>
      <h1 id="hero-title" className="hero-heading mt-6">Department operations, <span className="text-[var(--color-accent)]">organized.</span></h1>
      <span aria-hidden="true" className="brig-accent-rule mt-6"/>
      <p className="mt-7 text-base sm:text-lg leading-[1.75] text-[var(--color-muted)] max-w-[52ch]">Manage staff records, course allocation, leave requests and departmental decisions from one considered workspace.</p>
      <div className="mt-8 flex flex-wrap items-center gap-3">
       <Link href="/login" className="btn btn-large">Sign in to Brig <ArrowRight size={17} aria-hidden="true"/></Link>
       <Link href="#features" className="btn btn-outline btn-large">Explore features</Link>
      </div>
      <div className="mt-9 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[var(--color-muted)]">
       <span className="inline-flex items-center gap-2"><CheckCircle2 size={16} className="text-[var(--color-success)]"/> Staff records</span>
       <span className="inline-flex items-center gap-2"><CheckCircle2 size={16} className="text-[var(--color-success)]"/> Clear approvals</span>
       <span className="inline-flex items-center gap-2"><CheckCircle2 size={16} className="text-[var(--color-success)]"/> Role-based access</span>
      </div>
     </div>
     <div className="relative min-w-0">
      <div className="hero-showcase relative">
       <CampusPhoto kind="campus" className="absolute inset-0" priority sizes="(max-width:1024px) 100vw, 53vw"/>
       <div className="absolute inset-0 bg-gradient-to-b from-[#11243A]/5 to-[#11243A]/40"/>
       <div className="hero-photo-caption absolute top-5 left-5 sm:top-6 sm:left-6 text-white text-xs font-semibold">Designed for academic departments</div>
       <div className="hero-product brig-hero-card"><WorkspacePreview/></div>
      </div>
     </div>
    </div>
   </section>
   <section id="features" className="brig-section bg-[#FFFEFB]" aria-labelledby="features-title">
    <div className="max-w-7xl mx-auto px-5 sm:px-8">
     <div className="flex flex-wrap justify-between items-end gap-6 mb-10">
      <div><p className="brig-section-label mb-4">Everyday work, in order</p><h2 id="features-title" className="section-heading max-w-[19ch]">Less chasing. More getting things done.</h2></div>
      <p className="text-[var(--color-muted)] max-w-[40ch] leading-relaxed">A straightforward way to manage the work that happens across a university department.</p>
     </div>
     <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {features.map(({number,icon:Icon,title,detail})=><article className="feature-card" key={title}>
       <span className="brig-feature-number">{number}</span>
       <div className="feature-icon mt-6"><Icon size={22} strokeWidth={1.9} aria-hidden="true"/></div>
       <h3 className="text-lg font-bold mt-5">{title}</h3><p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">{detail}</p>
      </article>)}
     </div>
    </div>
   </section>
   <section id="roles" className="brig-section" aria-labelledby="roles-title">
    <div className="max-w-7xl mx-auto px-5 sm:px-8 grid lg:grid-cols-[.9fr_1.1fr] gap-10 lg:gap-20 items-center">
     <div>
      <p className="brig-section-label mb-4">One department. Three roles.</p>
      <h2 id="roles-title" className="section-heading">The right tools for the right people.</h2>
      <p className="mt-5 text-[var(--color-muted)] leading-[1.75] max-w-[50ch]">The work is shared, but access is not. Brig gives each role a clear view of its responsibilities.</p>
      <div className="brig-photo-wrap mt-8 h-[240px] sm:h-[300px]">
       <CampusPhoto kind="collaboration" className="absolute inset-0" sizes="(max-width:1024px) 100vw, 44vw"/>
      </div>
     </div>
     <div className="brig-surface p-6 sm:p-8">
      {roles.map(({icon:Icon,title,text},i)=><div key={title} className={`flex gap-4 items-start py-6 ${i===0?"pt-0":""} ${i===2?"pb-0":""} ${i>0?"border-t border-[var(--color-border)]":""}`}>
       <span className="feature-icon !w-11 !h-11 shrink-0"><Icon size={20} aria-hidden="true"/></span><div><h3 className="font-bold text-base">{title}</h3><p className="text-sm leading-relaxed text-[var(--color-muted)] mt-2">{text}</p></div>
      </div>)}
     </div>
    </div>
   </section>
   <section className="brig-section brig-dark-panel" aria-labelledby="safety-title">
    <div className="max-w-7xl mx-auto px-5 sm:px-8 grid md:grid-cols-[1fr_1fr] gap-10 md:gap-20 items-center">
     <div>
      <p className="text-[#DFC38D] text-xs font-semibold tracking-[.13em] uppercase mb-4">Built with responsibility</p>
      <h2 id="safety-title" className="section-heading !text-[#F7F4EE]">The details stay in the right hands.</h2>
      <p className="mt-5 text-[#E6E2D9] leading-relaxed max-w-[51ch]">Permissions protect sensitive staff information. Account approvals, audit records and secure sessions support accountable departmental work.</p>
      <Link href="/security" className="inline-flex min-h-11 items-center gap-2 mt-6 text-[#F1D6A2] font-semibold text-sm hover:text-white">How Brig protects records <ArrowRight size={16} aria-hidden="true"/></Link>
     </div>
     <div className="grid gap-4">
      <div className="rounded-xl border border-white/20 bg-white/5 p-5 flex gap-4"><LockKeyhole className="text-[#D7AE5D] shrink-0" size={23}/><div><h3 className="text-[#F7F4EE] font-semibold">Protected access</h3><p className="text-[#E6E2D9] text-sm mt-1">Only approved accounts can enter the workspace.</p></div></div>
      <div className="rounded-xl border border-white/20 bg-white/5 p-5 flex gap-4"><ShieldCheck className="text-[#D7AE5D] shrink-0" size={23}/><div><h3 className="text-[#F7F4EE] font-semibold">Accountability by design</h3><p className="text-[#E6E2D9] text-sm mt-1">Role permissions and audit logs help track important changes.</p></div></div>
     </div>
    </div>
   </section>
   <section className="bg-[#F0E5D0] py-12 sm:py-16" aria-label="Access Brig">
    <div className="max-w-7xl mx-auto px-5 sm:px-8 flex flex-wrap gap-6 items-center justify-between">
     <div><h2 className="editorial-heading text-2xl sm:text-3xl">Your department, in good order.</h2><p className="mt-2 text-[var(--color-muted)]">Continue to your workspace or request access.</p></div>
     <div className="flex gap-3 flex-wrap"><Link href="/login" className="btn">Sign in <ArrowRight size={16}/></Link><Link href="/register" className="btn btn-outline">Request access</Link></div>
    </div>
   </section>
  </main>
  <footer className="brig-footer">
   <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8 flex flex-wrap justify-between items-center gap-6 text-sm">
    <div><span className="text-[#F7F4EE] font-bold">Brig</span><span className="text-[#D9D6CE] ml-3">Department operations, organized.</span><p className="text-[#D9D6CE] text-xs mt-2">© {new Date().getFullYear()} Brig</p></div>
    <nav aria-label="Information" className="flex gap-5 flex-wrap"><Link href="/security">Security</Link><Link href="/login">Sign in</Link><Link href="/register">Request access</Link></nav>
   </div>
  </footer>
 </div>;
}
