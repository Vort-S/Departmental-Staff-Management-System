import type {Metadata} from "next";
export const metadata:Metadata={title:"Reset password",robots:{index:false,follow:false}};
import Link from "next/link";
import {ActionForm} from "@/components/ActionForm";
import {AuthShell} from "@/components/AuthShell";
export default function Forgot(){return <AuthShell title="Reset your password" description="If an account exists for that email, we will send a single-use password reset link.">
  <ActionForm variant="forgot" submitLabel="Send reset link" fields={[{name:"email",label:"Email address",type:"email",required:true}]}/>
  <Link className="inline-flex min-h-11 items-center font-semibold text-sm text-[var(--color-accent)] hover:underline mt-5" href="/login">Back to sign in</Link>
</AuthShell>}
