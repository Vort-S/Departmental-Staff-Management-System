import Link from "next/link";
import type {ReactNode} from "react";

/** Shared layout for account access, recovery and verification screens. */
export function AuthShell({title,description,children,wide=false}:{title:string,description:string,children:ReactNode,wide?:boolean}) {
  return <main id="main" className="min-h-screen px-4 py-12 sm:py-20 flex items-start sm:items-center justify-center">
    <div className={`w-full ${wide?"max-w-xl":"max-w-md"}`}>
      <Link href="/" className="inline-flex min-h-11 items-center text-sm font-semibold text-[var(--color-accent)] hover:underline">← Back to home</Link>
      <div className="card p-6 sm:p-9 mt-4">
        <div className="text-xs font-bold tracking-wide text-[var(--color-muted)] mb-5">DSMS / Account access</div>
        <h1 className="page-title">{title}</h1>
        <p className="muted text-sm sm:text-base mt-3 mb-8 leading-relaxed">{description}</p>
        {children}
      </div>
    </div>
  </main>;
}
