import type {Metadata} from "next";
export const metadata:Metadata={title:"Request staff access",robots:{index:false,follow:false}};
import Link from "next/link";
import {CheckCircle2,MailCheck,ShieldCheck} from "lucide-react";
import {ActionForm} from "@/components/ActionForm";
import {AuthShell} from "@/components/AuthShell";
export default async function Register({searchParams}:{searchParams:Promise<{invite?:string}>}){const {invite}=await searchParams;return <AuthShell wide title="Join Brig" description="Request access with your institutional email and assigned staff ID.">
  <ActionForm variant="register" submitLabel="Create account" fields={[{name:"email",label:"Institutional email",type:"email",required:true},{name:"staffId",label:"Assigned staff ID",placeholder:"CSC/0001",required:true},{name:"password",label:"Password",type:"password",required:true},{name:"inviteToken",label:"Invite",type:"hidden",defaultValue:invite??""}]}/>
  <section aria-label="What happens after registration" className="mt-7 rounded-[var(--radius-card)] bg-[var(--color-surface-soft)] p-5">
    <h2 className="font-semibold text-sm mb-4">What happens next</h2>
    <ol className="space-y-3 text-sm">
      <li className="flex items-start gap-3"><MailCheck size={18} className="text-[var(--color-accent)] shrink-0 mt-0.5" aria-hidden="true"/><span><strong className="block">Verify your email</strong><span className="muted">Open the verification link sent to your inbox.</span></span></li>
      <li className="flex items-start gap-3"><ShieldCheck size={18} className="text-[var(--color-accent)] shrink-0 mt-0.5" aria-hidden="true"/><span><strong className="block">Wait for approval</strong><span className="muted">Your department administrator reviews your access request.</span></span></li>
      <li className="flex items-start gap-3"><CheckCircle2 size={18} className="text-[var(--color-success)] shrink-0 mt-0.5" aria-hidden="true"/><span><strong className="block">Sign in</strong><span className="muted">Use your account when it is activated.</span></span></li>
    </ol>
  </section>
  <p className="text-sm text-[var(--color-muted)] mt-7">Already registered? <Link className="font-semibold text-[var(--color-accent)] hover:underline" href="/login">Sign in</Link></p>
</AuthShell>}
