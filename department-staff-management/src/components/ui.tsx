import Link from "next/link";
import type {ReactNode} from "react";

export function PageHead({title,subtitle,action}:{title:string,subtitle?:string,action?:ReactNode}) {
  return <div className="flex flex-wrap gap-4 justify-between items-start mb-8"><div className="max-w-3xl"><h1 className="page-title">{title}</h1>{subtitle&&<p className="muted mt-2 text-sm sm:text-base leading-relaxed">{subtitle}</p>}</div>{action&&<div>{action}</div>}</div>;
}
export function Panel({title,children,subtitle}:{title?:string,children:ReactNode,subtitle?:string}) {
  return <section className="card p-5 sm:p-6 mb-6">{title&&<header className="mb-5"><h2 className="section-title">{title}</h2>{subtitle&&<p className="muted text-sm mt-2">{subtitle}</p>}</header>}{children}</section>;
}
export function Tag({children}:{children:ReactNode}) { return <span className="tag">{children}</span>; }
export function Table({headers,rows,empty="No records found."}:{headers:string[],rows:ReactNode[][],empty?:string}) {
  return <div className="table-wrap" role="region" aria-label="Data table, scroll horizontally to see all columns" tabIndex={0}>
    <table><thead><tr>{headers.map((h,i)=><th key={i} scope="col">{h}</th>)}</tr></thead>
      <tbody>{rows.length?rows.map((r,i)=><tr key={i}>{r.map((v,j)=><td key={j}>{v}</td>)}</tr>):
        <tr><td colSpan={headers.length}><div className="flex flex-col items-center gap-2 py-8 px-4 text-center"><p className="font-semibold text-sm">{empty}</p><p className="muted text-sm">Records will appear here when they are available.</p></div></td></tr>}
      </tbody>
    </table>
  </div>;
}
export function Stat({label,value,hint}:{label:string,value:string|number,hint?:string}) {
  return <div className="card p-5 sm:p-6"><p className="text-sm font-semibold muted">{label}</p><p className="metric mt-4">{value}</p>{hint&&<p className="muted text-sm mt-2">{hint}</p>}</div>;
}
export function Breadcrumb({label,href}:{label:string,href:string}) {return <Link href={href} className="text-sm text-[var(--color-accent)] font-semibold hover:underline">← {label}</Link>;}
export const formatDate=(v:Date|string|null|undefined)=>v?new Date(v).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}):"—";
