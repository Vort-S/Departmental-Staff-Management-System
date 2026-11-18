"use client";
import {useState,useTransition} from "react";
import {useRouter} from "next/navigation";
import {LoaderCircle} from "lucide-react";
import {archiveStaff,decideUser,changeRole} from "@/actions/staff";
import {decideLeave,recordLeaveOutcome,verifyDocument} from "@/actions/operations";
import {logoutAll} from "@/actions/auth";

type Kind="archive"|"approveUser"|"suspendUser"|"role"|"approveLeave"|"rejectLeave"|"recordLeave"|"verifyDoc"|"rejectDoc"|"logoutAll";
export function ActionButton({kind,id,label,role}:{kind:Kind,id?:string,label?:string,role?:"ADMIN"|"HOD"|"STAFF"}){
  const [pending,start]=useTransition();
  const [message,setMessage]=useState("");
  const [error,setError]=useState(false);
  const router=useRouter();
  const destructive=["archive","suspendUser","rejectLeave","logoutAll"].includes(kind);
  const handler=()=>{
    if(destructive&&!confirm(`Confirm ${label??kind}?`))return;
    setMessage("");setError(false);
    start(async()=>{
      try{
        let result:{ok:boolean,message?:string,error?:string};
        switch(kind){
          case "archive":result=await archiveStaff({id});break;
          case "approveUser":result=await decideUser({userId:id,decision:"APPROVE"});break;
          case "suspendUser":result=await decideUser({userId:id,decision:"SUSPEND"});break;
          case "role":result=await changeRole({userId:id,role});break;
          case "approveLeave":result=await decideLeave({requestId:id,decision:"APPROVED",comment:prompt("Decision comment (optional)")??""});break;
          case "rejectLeave":result=await decideLeave({requestId:id,decision:"REJECTED",comment:prompt("Reason for rejection")??""});break;
          case "recordLeave":result=await recordLeaveOutcome({id});break;
          case "verifyDoc":result=await verifyDocument({id,status:"VERIFIED"});break;
          case "rejectDoc":result=await verifyDocument({id,status:"REJECTED"});break;
          default:result=await logoutAll();
        }
        setError(!result.ok);
        setMessage(result.ok?(result.message??"Done"):(result.error??"Unable to complete this action."));
        if(result.ok){router.refresh();if(kind==="logoutAll")router.push("/login");}
      }catch{
        setError(true);
        setMessage("Request failed. Please try again.");
      }
    });
  };
  return <span className="inline-flex flex-col gap-1 items-start">
    <button className={`btn ${destructive?"btn-danger":"btn-outline"} !px-3 !text-xs`} type="button" onClick={handler} disabled={pending} aria-busy={pending}>
      {pending?<><LoaderCircle size={15} className="animate-spin" aria-hidden="true"/>Working…</>:label??kind}
    </button>
    {message&&<span role={error?"alert":"status"} className={`text-xs max-w-52 ${error?"text-[var(--color-danger)]":"muted"}`}>{message}</span>}
  </span>;
}
