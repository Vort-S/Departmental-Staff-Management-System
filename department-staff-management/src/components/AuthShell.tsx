import Link from "next/link";
import type {ReactNode} from "react";
import {ArrowLeft} from "lucide-react";
import {BrigBrand} from "@/components/BrigLogo";
import {CampusPhoto} from "@/components/CampusPhoto";

/** Consistent, distraction-free account layout. The photo illustrates university life, not staff identity. */
export function AuthShell({title,description,children,wide=false}:{title:string,description:string,children:ReactNode,wide?:boolean}){
  return <main id="main" className="auth-page min-h-screen grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
    <div className="hidden lg:flex auth-visual relative flex-col justify-between overflow-hidden p-10 xl:p-14">
      <CampusPhoto kind="collaboration" className="absolute inset-0" priority sizes="50vw"/>
      <div className="auth-photo-shade"/>
      <Link href="/" className="relative z-10 inline-flex items-center gap-3 text-white hover:text-white font-extrabold text-xl tracking-tight"><BrigBrand inverse/></Link>
      <div className="relative z-10 max-w-xl text-white">
        <h2 className="text-[clamp(2.25rem,3.1vw,3.5rem)] font-bold tracking-[-.045em] leading-[1.13]">Department operations, organized.</h2>
        <p className="mt-5 text-base text-white/90 leading-relaxed max-w-md">Bring staff records, teaching allocations and leave decisions together—without losing track of what needs attention.</p>
        <span className="mt-7 inline-block h-[3px] w-[52px] bg-[#D3AB5E] rounded-full" aria-hidden="true"/>
      </div>
    </div>
    <div className="auth-form-pane px-4 sm:px-8 xl:px-14 py-8 sm:py-12 flex items-center justify-center">
      <div className={`w-full ${wide?"max-w-lg":"max-w-md"}`}>
        <Link href="/" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[var(--color-muted)] hover:text-[var(--color-accent)]"><ArrowLeft size={17} aria-hidden="true"/> Back to home</Link>
        <div className="mt-8 sm:mt-12">
          <div className="lg:hidden inline-flex items-center gap-2.5 mb-7 font-extrabold text-xl text-[var(--color-text)]"><BrigBrand/></div>
          <h1 className="auth-heading">{title}</h1>
          <p className="mt-3 mb-8 text-sm sm:text-base text-[var(--color-muted)] leading-relaxed">{description}</p>
          {children}
        </div>
      </div>
    </div>
  </main>;
}
