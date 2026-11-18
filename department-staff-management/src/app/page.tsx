export const dynamic = "force-dynamic";
import Link from "next/link";
import type {Metadata} from "next";
import {ArrowRight,BookOpen,CalendarDays,ClipboardCheck,FileText,Search,ShieldCheck,Users,Check,Building2} from "lucide-react";
import {CampusPhoto} from "@/components/CampusPhoto";

export const metadata:Metadata={alternates:{canonical:"/"}};

const features=[
  {icon:Users,title:"Staff directory",detail:"Search profiles, track roles and maintain departmental records."},
  {icon:BookOpen,title:"Teaching allocations",detail:"Keep course assignments and lecturer workloads organized."},
  {icon:CalendarDays,title:"Leave requests",detail:"Submit leave, review decisions and track balances."},
  {icon:ClipboardCheck,title:"Department oversight",detail:"Review attendance, notices and administrative activity."}
];

function WorkspacePreview(){
  return <div className="product-preview" aria-label="Example layout of the staff directory, with the current empty state">
    <div className="flex min-h-[265px]">
      <div className="preview-sidebar hidden sm:flex w-[110px] shrink-0 flex-col p-3 gap-3" aria-hidden="true">
        <span className="font-bold text-[13px] tracking-tight mt-1">DSMS</span>
        <div className="rounded-lg bg-white/15 px-2 py-2 text-[10px] font-semibold">Directory</div>
        <span className="text-white/70 text-[10px] px-2">Dashboard</span>
        <span className="text-white/70 text-[10px] px-2">Courses</span>
        <span className="text-white/70 text-[10px] px-2">Leave</span>
      </div>
      <div className="min-w-0 flex-1 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center justify-center rounded-lg bg-[var(--color-accent-soft)] text-[var(--color-accent)] w-9 h-9"><Users size={17} aria-hidden="true"/></span>
            <div><div className="font-bold text-sm sm:text-base">Staff directory</div><p className="text-[11px] text-[var(--color-muted)]">Department records</p></div>
          </div>
          <div className="hidden sm:inline-flex rounded-md bg-[var(--color-accent)] px-2.5 py-1.5 text-[10px] font-semibold text-white">Add staff</div>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] p-2.5 mb-3 text-xs text-[var(--color-muted)]">
          <Search size={15} aria-hidden="true"/><span>Search by name, ID or rank</span>
        </div>
        <div className="rounded-lg border border-[var(--color-border)] overflow-hidden">
          <div className="flex justify-between gap-2 px-3 py-2.5 text-[11px] font-semibold bg-[var(--color-surface-soft)]"><span>Staff records</span><span className="text-[var(--color-muted)] font-medium">0 records</span></div>
          <div className="grid grid-cols-[.8fr_1.5fr_.8fr] gap-3 px-3 py-2.5 border-y border-[var(--color-border)] text-[10px] font-semibold text-[var(--color-muted)]"><span>Staff ID</span><span>Name</span><span>Status</span></div>
          <div className="flex items-center justify-center gap-2 py-6 text-xs text-[var(--color-muted)]"><FileText size={16} aria-hidden="true"/>No staff records yet</div>
        </div>
      </div>
    </div>
  </div>;
}

export default function Home(){
  return <div className="min-h-screen flex flex-col">
    <header className="public-top">
      <div className="max-w-7xl mx-auto py-3 px-5 sm:px-8 flex items-center justify-between gap-4">
        <Link href="/" className="inline-flex items-center gap-2.5 text-[var(--color-text)] hover:text-[var(--color-text)]" aria-label="DSMS home">
          <span className="brand-mark"><Building2 size={21} strokeWidth={2} aria-hidden="true"/></span>
          <span className="font-extrabold text-xl tracking-tight">DSMS</span>
        </Link>
        <nav aria-label="Public navigation" className="flex gap-4 sm:gap-6 items-center text-sm">
          <Link className="hidden sm:inline text-[var(--color-muted)] font-medium hover:text-[var(--color-text)]" href="#features">Features</Link>
          <Link className="hidden md:inline text-[var(--color-muted)] font-medium hover:text-[var(--color-text)]" href="/security">Security</Link>
          <Link href="/login" className="btn">Sign in <ArrowRight size={17} aria-hidden="true"/></Link>
        </nav>
      </div>
    </header>
    <main id="main" className="flex-1">
      <section className="hero-section" aria-labelledby="hero-title">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid lg:grid-cols-[.88fr_1.12fr] gap-10 lg:gap-12 items-center py-14 sm:py-16 lg:py-20">
          <div className="min-w-0">
            <h1 id="hero-title" className="hero-heading">Staff records, courses and leave. <span className="text-[var(--color-accent)]">All in one place.</span></h1>
            <p className="mt-6 sm:mt-7 text-base sm:text-lg leading-[1.7] text-[var(--color-muted)] max-w-[52ch]">A single workspace for departmental staff information, teaching assignments, leave approvals and everyday administration.</p>
            <div className="mt-8 flex items-center flex-wrap gap-3">
              <Link href="/login" className="btn btn-large">Sign in to DSMS <ArrowRight size={19} aria-hidden="true"/></Link>
              <Link href="/register" className="btn btn-outline btn-large">Create account</Link>
            </div>
            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-[var(--color-muted)]">
              <span className="inline-flex items-center gap-1.5"><Check className="text-[var(--color-success)]" size={17} aria-hidden="true"/> Staff profiles</span>
              <span className="inline-flex items-center gap-1.5"><Check className="text-[var(--color-success)]" size={17} aria-hidden="true"/> Course allocation</span>
              <span className="inline-flex items-center gap-1.5"><Check className="text-[var(--color-success)]" size={17} aria-hidden="true"/> Leave approvals</span>
            </div>
          </div>
          <div className="hero-showcase relative min-w-0">
            <CampusPhoto kind="campus" className="absolute inset-x-0 top-0 h-[55%]" priority sizes="(max-width: 1024px) 100vw, 54vw"/>
            <div className="hero-photo-caption absolute top-5 left-5 sm:top-6 sm:left-6 inline-flex items-center gap-2 text-white text-xs sm:text-sm font-semibold"><Building2 size={17} aria-hidden="true"/> Built for university departments</div>
            <div className="hero-product"><WorkspacePreview/></div>
          </div>
        </div>
      </section>
      <section id="features" className="bg-white py-16 md:py-22" aria-labelledby="features-title">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid lg:grid-cols-[.82fr_1.18fr] gap-9 lg:gap-14 items-center">
            <div>
              <h2 id="features-title" className="section-heading">Everything your department needs to stay organized.</h2>
              <p className="mt-4 leading-[1.7] text-[var(--color-muted)] max-w-[48ch]">From staff profiles to course assignments, keep the work that matters easy to find and easier to manage.</p>
              <CampusPhoto kind="collaboration" className="relative mt-7 rounded-[var(--radius-card)] h-[245px] sm:h-[280px]" sizes="(max-width: 1024px) 100vw, 39vw"/>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {features.map(({icon:Icon,title,detail})=><article key={title} className="feature-card">
                <div className="feature-icon"><Icon size={23} strokeWidth={1.9} aria-hidden="true"/></div>
                <h3 className="text-lg font-bold mt-7">{title}</h3>
                <p className="mt-2 text-sm sm:text-base leading-relaxed text-[var(--color-muted)]">{detail}</p>
              </article>)}
            </div>
          </div>
        </div>
      </section>
      <section className="py-16 md:py-20" aria-labelledby="control-title">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid lg:grid-cols-[1fr_.85fr] items-center gap-10 lg:gap-20">
          <div>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)] mb-6"><ShieldCheck size={25} aria-hidden="true"/></div>
            <h2 id="control-title" className="section-heading">Clear permissions. Better oversight.</h2>
            <p className="mt-4 text-[var(--color-muted)] leading-[1.7] max-w-[50ch]">Different views for administrators, heads of department and staff. Sensitive information is restricted, and important changes are logged.</p>
            <Link className="inline-flex gap-2 items-center mt-6 min-h-11 text-sm font-bold text-[var(--color-accent)] hover:underline" href="/security">Explore security features <ArrowRight size={17} aria-hidden="true"/></Link>
          </div>
          <div className="rounded-[var(--radius-card)] bg-white border border-[var(--color-border)] p-6 sm:p-8">
            <div className="flex gap-4 items-start pb-6 border-b border-[var(--color-border)]"><span className="feature-icon !w-11 !h-11 shrink-0"><ShieldCheck size={21} aria-hidden="true"/></span><div><h3 className="font-bold">Role-based access</h3><p className="text-sm text-[var(--color-muted)] leading-relaxed mt-1">Users only see tools and information available to their role.</p></div></div>
            <div className="flex gap-4 items-start pt-6"><span className="feature-icon !w-11 !h-11 shrink-0"><FileText size={21} aria-hidden="true"/></span><div><h3 className="font-bold">Accountable administration</h3><p className="text-sm text-[var(--color-muted)] leading-relaxed mt-1">Staff updates, approvals and security events are auditable.</p></div></div>
          </div>
        </div>
      </section>
      <section className="bg-[var(--color-sidebar)] text-white" aria-label="Sign in to your department workspace">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12 md:py-16 flex flex-wrap items-center justify-between gap-7">
          <div><h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Ready to manage your department?</h2><p className="text-white/80 mt-3">Continue to your staff workspace.</p></div>
          <Link href="/login" className="btn !bg-white !text-[var(--color-accent)] hover:!bg-[var(--color-accent-soft)]">Sign in <ArrowRight size={17} aria-hidden="true"/></Link>
        </div>
      </section>
    </main>
    <footer className="bg-white border-t border-[var(--color-border)]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-7 flex flex-wrap justify-between gap-4 text-sm text-[var(--color-muted)]">
        <span>© {new Date().getFullYear()} DSMS · Departmental Staff Management</span>
        <nav aria-label="Project information" className="flex flex-wrap gap-x-5 gap-y-2"><Link href="/security">Security</Link><Link href="/testing">Testing</Link><Link href="/review">Review</Link></nav>
      </div>
    </footer>
  </div>;
}
