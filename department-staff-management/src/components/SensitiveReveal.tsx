"use client";
import {useState,useTransition} from "react";
import {Eye,EyeOff,LoaderCircle} from "lucide-react";
import {revealSensitive} from "@/actions/staff";
export function SensitiveReveal({id,field,label}:{id:string,field:"nationalId"|"homeAddress"|"emergencyContact"|"phone"|"dateOfBirth",label:string}) {
  const [value,setValue]=useState<string|null>(null);
  const [error,setError]=useState("");
  const [pending,start]=useTransition();
  const toggle=()=>{
    if(value!==null){setValue(null);setError("");return;}
    setError("");
    start(async()=>{
      try{
        const result=await revealSensitive({id,field});
        if(result.ok){setValue(result.value);}else{setError("You do not have permission to reveal this field.");}
      }catch{setError("Unable to reveal this information right now.");}
    });
  };
  return <div className="flex items-start justify-between gap-4 flex-wrap rounded-[var(--radius-control)] bg-[var(--color-surface-soft)] p-4">
    <div className="min-w-0 flex-1"><p className="muted text-sm mb-2">{label}</p><p className="break-all font-semibold text-sm">{value??"••••••••"}</p>{error&&<p role="alert" className="text-xs text-[var(--color-danger)] mt-2">{error}</p>}</div>
    <button type="button" className="btn btn-outline text-xs" aria-label={`${value!==null?"Hide":"Reveal"} ${label.toLowerCase()}`} aria-busy={pending} disabled={pending} onClick={toggle}>
      {pending?<LoaderCircle size={16} className="animate-spin" aria-hidden="true"/>:value!==null?<EyeOff size={16} aria-hidden="true"/>:<Eye size={16} aria-hidden="true"/>}
      {pending?"Checking…":value!==null?"Hide":"Reveal"}
    </button>
  </div>;
}
