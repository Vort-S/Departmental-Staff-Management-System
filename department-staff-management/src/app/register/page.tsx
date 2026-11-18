import type {Metadata} from "next";
export const metadata:Metadata={title:"Request staff access",robots:{index:false,follow:false}};
import Link from "next/link";
import {ActionForm} from "@/components/ActionForm";
import {AuthShell} from "@/components/AuthShell";
export default async function Register({searchParams}:{searchParams:Promise<{invite?:string}>}){const {invite}=await searchParams;return <AuthShell wide title="Request staff access" description="Get started with your department email and assigned staff ID.">
  <ActionForm variant="register" submitLabel="Create account" fields={[{name:"email",label:"Institutional email",type:"email",required:true},{name:"staffId",label:"Assigned staff ID",placeholder:"CSC/0001",required:true},{name:"password",label:"Password",type:"password",required:true},{name:"inviteToken",label:"Invite",type:"hidden",defaultValue:invite??""}]}/>
  <p className="text-sm text-[var(--color-muted)] mt-7">Already registered? <Link className="font-semibold text-[var(--color-accent)] hover:underline" href="/login">Sign in</Link></p>
</AuthShell>}
