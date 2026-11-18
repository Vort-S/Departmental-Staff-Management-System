import type {Metadata} from "next";
export const metadata:Metadata={title:"Choose a new password",robots:{index:false,follow:false}};
import {ActionForm} from "@/components/ActionForm";
import {AuthShell} from "@/components/AuthShell";
export default async function Reset({searchParams}:{searchParams:Promise<{token?:string}>}){const {token}=await searchParams;return <AuthShell title="Choose a new password" description="Choose a new password. Your reset link is valid for 30 minutes.">
  <ActionForm variant="reset" submitLabel="Update password" redirectTo="/login" fields={[{name:"token",label:"Token",type:"hidden",defaultValue:token??""},{name:"password",label:"New password",type:"password",required:true}]}/>
</AuthShell>}
