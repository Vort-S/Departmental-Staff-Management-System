import Link from "next/link";
import {ShieldCheck} from "lucide-react";
const security=[
 ["Passwords and registration","Argon2id, length/complexity/common-password rules, email verification and administrator approval","A07 Identification & Authentication Failures"],
 ["Session lifecycle","Random 256-bit IDs stored as keyed hashes, HttpOnly/Lax/Secure cookies, 30-min idle / 12-hour absolute expiry, revocation","A07 Identification & Authentication Failures"],
 ["Authorization","Proxy hints plus server access guards, department/object filtering, field visibility, no self-approval","A01 Broken Access Control"],
 ["Database safety","Drizzle bound SQL values, allowlisted filters/sorts, constraints, transactional leave approvals","A03 Injection / A04 Insecure Design"],
 ["Content safety","React output escaping, plain-text notes, URL host allowlists and nonce-based CSP","A03 Injection / A05 Security Misconfiguration"],
 ["Cross-site request forgery","Origin verification for actions, SameSite cookies and a signed CSRF token for the logout API","A01 Broken Access Control"],
 ["Sensitive data","AES-256-GCM field encryption with environment key, masked UI, audited reveal","A02 Cryptographic Failures"],
 ["Abuse prevention","Atomic database rate limits, account lockouts, generic failure responses","A07 Identification & Authentication Failures"],
 ["Audit & monitoring","Append-only DB trigger, actor/time/IP hash/event, admin-only log view","A09 Security Logging & Monitoring Failures"],
 ["Deployment hardening","HTTPS/HSTS, no frame embedding, referrer restrictions, server-only secrets and CI audit","A05 Security Misconfiguration / A06 Vulnerable Components"]
];
export default function Security(){return <main className="max-w-5xl mx-auto p-5 md:p-10"><Link className="text-blue-700 text-sm" href="/">← Home</Link><div className="mt-8 flex items-center gap-3"><ShieldCheck className="text-blue-700" size={30}/><h1 className="page-title">Security architecture</h1></div><p className="muted mt-4 mb-8">Implemented controls, mitigated threats and OWASP Top 10 (2021) mappings. For a threat model and operational requirements see SECURITY.md.</p><div className="space-y-4">{security.map(([name,measure,owasp])=><section key={name} className="card p-5"><h2 className="font-bold text-lg">{name}</h2><p className="text-sm text-slate-700 mt-2">{measure}</p><p className="text-xs font-semibold text-blue-700 mt-3">{owasp}</p></section>)}</div><p className="text-sm muted mt-7">Security claims describe code-level controls; a penetration test and production verification remain necessary before real personal information is introduced.</p></main>}
