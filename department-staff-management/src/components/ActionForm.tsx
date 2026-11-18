"use client";
import {useState,useTransition} from "react";
import {useRouter} from "next/navigation";
import {AlertCircle,Eye,EyeOff,LoaderCircle} from "lucide-react";
import type {ZodType} from "zod";
import {register,login,requestReset,resetPassword,verifyEmail,resendVerification,changePassword} from "@/actions/auth";
import {updateMyProfile,updateSensitive,createStaff,editStaff,inviteUser} from "@/actions/staff";
import {addCourse,assignCourse,submitLeave,recordAttendance,addDocument,addPublication,addAppraisal,addNotice} from "@/actions/operations";
import * as v from "@/lib/validators";

type Result={ok:boolean,message?:string,error?:string,code?:string};
const actions={register,login,forgot:requestReset,reset:resetPassword,verify:verifyEmail,resend:resendVerification,change:changePassword,profile:updateMyProfile,sensitive:updateSensitive,newStaff:createStaff,editStaff,invite:inviteUser,course:addCourse,assign:assignCourse,leave:submitLeave,attendance:recordAttendance,document:addDocument,publication:addPublication,appraisal:addAppraisal,notice:addNotice};
const schemas:Record<keyof typeof actions,ZodType>={register:v.registerSchema.extend({inviteToken:v.verifyEmailSchema.shape.token.optional()}),login:v.loginSchema,forgot:v.resetRequestSchema,reset:v.resetSchema,verify:v.verifyEmailSchema,resend:v.resetRequestSchema,change:v.changePasswordSchema,profile:v.profileSchema,sensitive:v.sensitiveUpdateSchema,newStaff:v.staffCreateSchema,editStaff:v.staffAdminUpdateSchema,invite:v.inviteSchema,course:v.courseSchema,assign:v.assignmentSchema,leave:v.leaveSchema,attendance:v.attendanceSchema,document:v.documentSchema,publication:v.publicationSchema,appraisal:v.appraisalSchema,notice:v.noticeSchema};
export type Field={name:string,label:string,type?:"text"|"email"|"password"|"date"|"number"|"url"|"textarea"|"select"|"hidden",placeholder?:string,required?:boolean,defaultValue?:string|number|null,options?:{value:string,label:string}[]};

export function ActionForm({variant,fields,submitLabel="Save",redirectTo,compact=false}:{variant:keyof typeof actions,fields:Field[],submitLabel?:string,redirectTo?:string,compact?:boolean}){
  const [pending,start]=useTransition();
  const [message,setMessage]=useState("");
  const [error,setError]=useState(false);
  const [issues,setIssues]=useState<Record<string,string>>({});
  const [password,setPassword]=useState("");
  const [showLoginPassword,setShowLoginPassword]=useState(false);
  const router=useRouter();
  const showStrength=["register","reset","change"].includes(variant);
  const passwordScore=[password.length>=12,/[a-z]/.test(password),/[A-Z]/.test(password),/\d/.test(password),/[^\w\s]/.test(password),!/(password|qwerty|123456|welcome)/i.test(password)].filter(Boolean).length;

  const submit=(event:React.FormEvent<HTMLFormElement>)=>{
    event.preventDefault();
    if(pending)return;
    setMessage(""); setError(false); setIssues({});
    const form=event.currentTarget;
    const fd=new FormData(form);
    const payload:Record<string,unknown>={};
    for(const f of fields){
      const raw=String(fd.get(f.name)??"");
      payload[f.name]=(f.type==="number"||f.name==="semester")?Number(raw):["photoUrl","phone","homeAddress","nationalId","emergencyContact","dateOfBirth","url"].includes(f.name)&&!raw?null:raw;
    }
    if(variant==="register"&&!payload.inviteToken)delete payload.inviteToken;
    const parsed=schemas[variant].safeParse(payload);
    if(!parsed.success){
      const errs:Record<string,string>={};
      for(const issue of parsed.error.issues){const key=String(issue.path[0]??"form");errs[key]??=issue.message;}
      setIssues(errs);setError(true);
      setMessage("Please correct the highlighted fields.");
      const firstField=fields.find(f=>errs[f.name]);
      if(firstField){const control=form.elements.namedItem(firstField.name);if(control instanceof HTMLElement)control.focus();}
      return;
    }
    start(async()=>{
      try{
        const result:Result=await (actions[variant] as (x:unknown)=>Promise<Result>)(payload);
        setError(!result.ok);
        setMessage(result.ok?(result.message??"Saved."):(result.error??"Unable to save. Please review your information and try again."));
        if(result.ok){
          if(variant==="login"){
            // Confirm the session cookie was accepted before leaving the login page.
            try {
              const check=await fetch("/api/session/csrf",{method:"GET",credentials:"same-origin",cache:"no-store"});
              if(!check.ok){
                setError(true);
                setMessage("Your sign-in was accepted but the session could not be saved in this browser. Enable cookies for this site, refresh the page and try again.");
                return;
              }
            } catch {
              setError(true);
              setMessage("Your sign-in was accepted but the session could not be confirmed. Check your connection and try again.");
              return;
            }
            // Full navigation ensures the server sees the new secure cookie immediately.
            window.location.assign(redirectTo??"/dashboard");
            return;
          }
          if(redirectTo)router.replace(redirectTo);
          router.refresh();
        }
      }catch{
        setError(true);
        setMessage("Unable to complete the request right now. Please try again.");
      }
    });
  };

  return <form onSubmit={submit} noValidate className={compact?"space-y-4":"space-y-5"} aria-label={`${variant} form`}>
    <fieldset disabled={pending} className="min-w-0">
      <div className="grid-form">
        {fields.map(f=>{
          const id=`${variant}-${f.name}`;
          const invalid=!!issues[f.name];
          const errorId=`${id}-error`;
          const describe=invalid?errorId:undefined;
          const strength=f.type==="password"&&showStrength&&["password","next"].includes(f.name);
          return <div key={f.name} className={f.type==="textarea"?"sm:col-span-2":"min-w-0"}>
            {f.type!=="hidden"&&<label htmlFor={id}>{f.label}{f.required&&<span className="text-[var(--color-danger)]" aria-label="required"> *</span>}</label>}
            {f.type==="select"?
              <select id={id} name={f.name} defaultValue={f.defaultValue??""} required={f.required} aria-invalid={invalid} aria-describedby={describe}>
                {!f.defaultValue&&<option value="">Select an option</option>}
                {(f.options??[]).map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
              </select>:
              f.type==="textarea"?<textarea id={id} name={f.name} defaultValue={f.defaultValue??""} placeholder={f.placeholder} required={f.required} aria-invalid={invalid} aria-describedby={describe}/>:
              <div className={variant==="login"&&f.type==="password"?"relative":""}>
                <input id={id} name={f.name} type={variant==="login"&&f.type==="password"&&showLoginPassword?"text":f.type??"text"} defaultValue={f.defaultValue??""} required={f.required} placeholder={f.placeholder} aria-invalid={invalid} aria-describedby={describe}
                  className={variant==="login"&&f.type==="password"?"!pr-14":undefined}
                  autoComplete={f.type==="email"?"email":f.type==="password"?(f.name==="current"||variant==="login"?"current-password":"new-password"):undefined}
                  min={f.type==="number"?0:undefined}
                  onChange={strength?e=>setPassword(e.currentTarget.value):undefined}/>
                {variant==="login"&&f.type==="password"&&<button type="button" onClick={()=>setShowLoginPassword(v=>!v)} aria-label={showLoginPassword?"Hide password":"Show password"} aria-pressed={showLoginPassword} className="absolute inset-y-0 right-0 flex min-w-12 items-center justify-center rounded-r-[var(--radius-control)] text-[var(--color-muted)] hover:text-[var(--color-text)] focus-visible:z-10">
                  {showLoginPassword?<EyeOff size={19} aria-hidden="true"/>:<Eye size={19} aria-hidden="true"/>}
                </button>}
              </div>
            }
            {invalid&&<p id={errorId} role="alert" className="text-sm text-[var(--color-danger)] mt-2">{issues[f.name]}</p>}
            {strength&&<div className="mt-3"><div className="progress" role="meter" aria-label="Password strength" aria-valuemin={0} aria-valuemax={6} aria-valuenow={passwordScore}><div style={{width:`${Math.max(passwordScore,1)/6*100}%`}}/></div><p className="field-note">Strength: {passwordScore>=5?"strong":passwordScore>=3?"moderate":"weak"} · Use 12+ characters, mixed case, a number and a symbol.</p></div>}
          </div>;
        })}
      </div>
    </fieldset>
    {issues.form&&<p role="alert" className="text-sm text-[var(--color-danger)]">{issues.form}</p>}
    <div aria-live="polite" aria-atomic="true" className={message?"":"sr-only"}>
      {message&&<div role={error?"alert":"status"} className={`alert ${error?"alert-error":""} flex items-start gap-2.5`}>
        {error&&<AlertCircle size={19} className="mt-0.5 shrink-0" aria-hidden="true"/>}
        <p className="min-w-0">{message}</p>
      </div>}
    </div>
    <button type="submit" disabled={pending} aria-busy={pending} className={`btn min-w-32 ${variant==="login"||variant==="register"?"w-full":""}`}>
      {pending&&<LoaderCircle className="animate-spin" size={17} aria-hidden="true"/>}{pending?"Processing…":submitLabel}
    </button>
  </form>;
}
