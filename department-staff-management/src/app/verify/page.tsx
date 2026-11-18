import type {Metadata} from "next";
export const metadata:Metadata={title:"Verify email",robots:{index:false,follow:false}};
import {ActionForm} from "@/components/ActionForm";
import {AuthShell} from "@/components/AuthShell";
export default async function Verify({searchParams}:{searchParams:Promise<{token?:string}>}){const {token}=await searchParams;return <AuthShell title="Verify your email" description="Confirm your email address to complete the first step of staff account approval.">
  <ActionForm variant="verify" submitLabel="Verify email" redirectTo="/login" fields={[{name:"token",label:"Token",type:"hidden",defaultValue:token??""}]}/>
  <section className="mt-8 pt-6 border-t border-[var(--color-border)]"><h2 className="section-title mb-3">Need another verification link?</h2>
    <ActionForm variant="resend" submitLabel="Resend verification" fields={[{name:"email",label:"Email address",type:"email",required:true}]}/>
  </section>
</AuthShell>}
