import type {Metadata} from "next";
export const metadata:Metadata={title:"Sign in",robots:{index:false,follow:false}};
import Link from "next/link";
import {redirect} from "next/navigation";
import {getUser} from "@/lib/session";
import {ActionForm} from "@/components/ActionForm";
import {AuthShell} from "@/components/AuthShell";
export default async function Login(){if(await getUser())redirect("/dashboard");return <AuthShell title="Welcome back to Brig" description="Sign in to pick up where your department left off.">
  <ActionForm variant="login" submitLabel="Sign in" redirectTo="/dashboard" fields={[{name:"email",label:"Email address",type:"email",required:true},{name:"password",label:"Password",type:"password",required:true}]}/>
  <div className="mt-7 pt-5 border-t border-[var(--color-border)] flex flex-wrap justify-between gap-x-4 gap-y-2 text-sm">
    <Link className="font-semibold text-[var(--color-accent)] hover:underline" href="/forgot">Forgot password?</Link>
    <Link className="text-[var(--color-accent)] hover:underline" href="/register">Request staff access</Link>
  </div>
</AuthShell>}
