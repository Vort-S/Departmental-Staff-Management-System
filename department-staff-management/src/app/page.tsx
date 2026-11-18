import Link from "next/link";
import type {Metadata} from "next";
export const metadata:Metadata={alternates:{canonical:"/"}};
import {ArrowRight, BookOpen, CalendarDays, ClipboardCheck, FileText, Search, ShieldCheck, Users} from "lucide-react";

const features = [
  {icon: Users, title: "Staff directory", detail: "Keep department profiles, roles and staff records in one searchable directory."},
  {icon: BookOpen, title: "Courses and teaching load", detail: "Manage course assignments by session and review lecturer workload."},
  {icon: CalendarDays, title: "Leave management", detail: "Submit requests, record decisions and review leave history and balances."},
  {icon: ClipboardCheck, title: "Department oversight", detail: "Review attendance, departmental notices, reports and administrative activity."}
];

function WorkspacePreview() {
  return <div className="product-preview" aria-label="Preview of the actual staff directory interface with no records loaded">
    <div className="flex min-h-[340px] sm:min-h-[390px]">
      <div className="preview-sidebar hidden sm:flex w-[134px] shrink-0 flex-col p-4 gap-4" aria-hidden="true">
        <span className="font-bold text-base tracking-tight">DSMS</span>
        <div className="rounded-md bg-white/15 px-2.5 py-2 text-[11px] font-semibold">Staff directory</div>
        <span className="text-white/65 text-[11px] px-2.5">Dashboard</span>
        <span className="text-white/65 text-[11px] px-2.5">Courses &amp; load</span>
        <span className="text-white/65 text-[11px] px-2.5">Leave requests</span>
      </div>
      <div className="min-w-0 flex-1 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2 mb-5">
          <div>
            <div className="font-bold text-base sm:text-lg tracking-tight">Staff directory</div>
            <div className="text-xs text-[var(--color-muted)] mt-1">Department staff records</div>
          </div>
          <span className="text-[11px] font-medium text-[var(--color-muted)] text-right">Interface preview</span>
        </div>
        <div className="border border-[var(--color-border)] rounded-xl p-3 sm:p-4 mb-4">
          <div className="flex items-center gap-2 text-xs font-semibold mb-2"><Search size={15} aria-hidden="true"/> Search staff</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="preview-filter col-span-2 sm:col-span-1">Name / ID / rank</div>
            <div className="preview-filter">All types</div>
            <div className="preview-filter">All statuses</div>
          </div>
        </div>
        <div className="border border-[var(--color-border)] rounded-xl overflow-hidden">
          <div className="px-4 py-3 font-semibold text-xs border-b border-[var(--color-border)]">Department staff</div>
          <div className="grid grid-cols-[1fr_1.5fr_1fr] gap-3 bg-[var(--color-surface-soft)] text-[10px] sm:text-xs font-semibold text-[var(--color-muted)] px-4 py-3">
            <span>Staff ID</span><span>Name</span><span>Status</span>
          </div>
          <div className="preview-empty">No records found.</div>
        </div>
      </div>
    </div>
    <div className="px-4 py-2.5 bg-[var(--color-surface-soft)] border-t border-[var(--color-border)] text-xs text-[var(--color-muted)]">
      Faithful interface recreation · no sample staff data
    </div>
  </div>;
}

export default function Home() {
  return <div className="min-h-screen flex flex-col">
    <header className="public-top">
      <div className="max-w-7xl mx-auto py-3 px-5 sm:px-8 flex items-center justify-between gap-4">
        <Link href="/" className="font-bold text-lg tracking-tight text-[var(--color-text)]" aria-label="DSMS home">DSMS <span className="hidden sm:inline font-normal text-sm text-[var(--color-muted)]">/ Staff management</span></Link>
        <nav aria-label="Public navigation" className="flex gap-3 sm:gap-6 items-center text-sm">
          <Link className="hidden sm:inline text-[var(--color-muted)] font-medium" href="/security">Security</Link>
          <Link href="/login" className="btn">Sign in <ArrowRight size={17} aria-hidden="true"/></Link>
        </nav>
      </div>
    </header>
    <main id="main" className="flex-1">
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-14 md:py-20 lg:py-24 grid lg:grid-cols-[minmax(0,.88fr)_minmax(0,1.12fr)] items-center gap-10 lg:gap-12" aria-labelledby="home-title">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--color-accent)] mb-5">For university departments</p>
          <h1 id="home-title" className="text-[clamp(2.4rem,5vw,4rem)] font-bold leading-[1.1] tracking-[-.045em] max-w-[15ch]">Manage staff, teaching and leave in one workspace.</h1>
          <p className="mt-6 text-base sm:text-lg leading-relaxed text-[var(--color-muted)] max-w-[52ch]">Find staff records, coordinate course assignments and review leave requests with permissions suited to administrators, heads of department and staff.</p>
          <div className="mt-8 flex items-center flex-wrap gap-4">
            <Link href="/login" className="btn">Sign in to workspace <ArrowRight size={18} aria-hidden="true"/></Link>
            <Link href="/register" className="text-sm font-semibold text-[var(--color-accent)] hover:underline inline-flex min-h-11 items-center">Request staff access</Link>
          </div>
          <p className="mt-6 text-sm text-[var(--color-muted)]">Accounts are verified and approved before access is granted.</p>
        </div>
        <WorkspacePreview/>
      </section>
      <section className="bg-white border-y border-[var(--color-border)]" aria-labelledby="features-title">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16 md:py-20">
          <div className="max-w-2xl mb-9">
            <h2 id="features-title" className="text-2xl md:text-3xl font-bold tracking-tight">Tools for everyday department operations</h2>
            <p className="mt-3 leading-relaxed text-[var(--color-muted)]">The core records and decisions that university staff work with, organized by task.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-7">
            {features.map(({icon: Icon,title,detail})=><article key={title} className="min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-soft)] flex items-center justify-center text-[var(--color-accent)]"><Icon size={20} strokeWidth={1.9} aria-hidden="true"/></div>
              <h3 className="text-base font-bold mt-5">{title}</h3>
              <p className="mt-2 text-sm text-[var(--color-muted)] leading-relaxed">{detail}</p>
            </article>)}
          </div>
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-16 md:py-20 grid md:grid-cols-[.6fr_1fr] gap-7 md:gap-14" aria-labelledby="security-title">
        <div>
          <div className="flex items-center gap-2 text-[var(--color-accent)] mb-4"><ShieldCheck size={20} strokeWidth={1.9} aria-hidden="true"/><span className="font-semibold text-sm">Controlled access</span></div>
          <h2 id="security-title" className="text-2xl md:text-3xl font-bold tracking-tight">Staff information stays behind role-based access.</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-6 text-sm leading-relaxed">
          <div><FileText size={20} className="text-[var(--color-accent)] mb-3" aria-hidden="true"/><h3 className="font-bold mb-2">Protect sensitive records</h3><p className="text-[var(--color-muted)]">Sensitive staff details have restricted visibility and encrypted storage.</p></div>
          <div><ShieldCheck size={20} className="text-[var(--color-accent)] mb-3" aria-hidden="true"/><h3 className="font-bold mb-2">Review administrative actions</h3><p className="text-[var(--color-muted)]">Account activation and other privileged activity are recorded in the audit log.</p></div>
          <Link className="text-[var(--color-accent)] font-semibold hover:underline sm:col-span-2" href="/security">Read the security architecture <ArrowRight size={16} className="inline align-[-3px]" aria-hidden="true"/></Link>
        </div>
      </section>
    </main>
    <footer className="border-t border-[var(--color-border)] bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-6 flex flex-wrap gap-4 justify-between text-sm text-[var(--color-muted)]">
        <span>DSMS · Departmental staff management</span>
        <nav aria-label="Project information" className="flex flex-wrap gap-x-5 gap-y-2"><Link href="/security">Security</Link><Link href="/testing">Testing</Link><Link href="/review">Project review</Link></nav>
      </div>
    </footer>
  </div>;
}
