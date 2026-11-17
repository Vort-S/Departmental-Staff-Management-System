"use client";
import {useState,useTransition} from "react";
import {useRouter} from "next/navigation";
import type {ZodType} from "zod";
import {register,login,requestReset,resetPassword,verifyEmail,resendVerification,changePassword} from "@/actions/auth";
import {updateMyProfile,updateSensitive,createStaff,editStaff,inviteUser} from "@/actions/staff";
import {addCourse,assignCourse,submitLeave,recordAttendance,addDocument,addPublication,addAppraisal,addNotice} from "@/actions/operations";
import * as v from "@/lib/validators";
type Result={ok:boolean,message?:string,error?:string};
const actions={register,login,forgot:requestReset,reset:resetPassword,verify:verifyEmail,resend:resendVerification,change:changePassword,profile:updateMyProfile,sensitive:updateSensitive,newStaff:createStaff,editStaff,invite:inviteUser,course:addCourse,assign:assignCourse,leave:submitLeave,attendance:recordAttendance,document:addDocument,publication:addPublication,appraisal:addAppraisal,notice:addNotice};
const schemas:Record<keyof typeof actions,ZodType>={register:v.registerSchema.extend({inviteToken:v.verifyEmailSchema.shape.token.optional()}),login:v.loginSchema,forgot:v.resetRequestSchema,reset:v.resetSchema,verify:v.verifyEmailSchema,resend:v.resetRequestSchema,change:v.changePasswordSchema,profile:v.profileSchema,sensitive:v.sensitiveUpdateSchema,newStaff:v.staffCreateSchema,editStaff:v.staffAdminUpdateSchema,invite:v.inviteSchema,course:v.courseSchema,assign:v.assignmentSchema,leave:v.leaveSchema,attendance:v.attendanceSchema,document:v.documentSchema,publication:v.publicationSchema,appraisal:v.appraisalSchema,notice:v.noticeSchema};
export type Field={name:string,label:string,type?:"text"|"email"|"password"|"date"|"number"|"url"|"textarea"|"select"|"hidden",placeholder?:string,required?:boolean,defaultValue?:string|number|null,options?:{value:string,label:string}[]};
export function ActionForm({variant,fields,submitLabel="Save",redirectTo,compact=false}:{variant:keyof typeof actions,fields:Field[],submitLabel?:string,redirectTo?:string,compact?:boolean}){
 const [pending,start]=useTransition(),[message,setMessage]=useState(""),[error,setError]=useState(false),[issues,setIssues]=useState<Record<string,string>>({}),router=useRouter();
 const [pw,setPw]=useState("");const score=[pw.length>=12,/[a-z]/.test(pw),/[A-Z]/.test(pw),/\d/.test(pw),/[^\w\s]/.test(pw),!/(password|qwerty|123456|welcome)/i.test(pw)].filter(Boolean).length;
 const submit=(e:React.FormEvent<HTMLFormElement>)=>{e.preventDefault();setMessage("");setIssues({});const fd=new FormData(e.currentTarget),payload:Record<string,unknown>={};for(const f of fields){const raw=String(fd.get(f.name)??"");payload[f.name]=(f.type==="number"||f.name==="semester")?Number(raw):["photoUrl","phone","homeAddress","nationalId","emergencyContact","dateOfBirth","url"].includes(f.name)&&!raw?null:raw;}
 if(variant==="register"&&!payload.inviteToken)delete payload.inviteToken;
 const schema=schemas[variant];
 // Change-password is validated separately because the form has current and next password.
 const parsed=schema.safeParse(payload);
 if(!parsed.success){const errs:Record<string,string>={};for(const i of parsed.error.issues){const key=String(i.path[0]??"form");errs[key]??=i.message;}setIssues(errs);return;}
 start(async()=>{const result:Result=await (actions[variant] as (x:unknown)=>Promise<Result>)(payload);setError(!result.ok);setMessage(result.ok?(result.message??"Saved."):(result.error??"Unable to save."));if(result.ok){router.refresh();if(redirectTo)router.push(redirectTo);}});
 };
 return <form onSubmit={submit} noValidate className={compact?"space-y-3":"space-y-4"} aria-label={`${variant} form`}>
 <div className="grid-form">{fields.map(f=><div key={f.name} className={f.type==="textarea"?"md:col-span-2":""}>{f.type!=="hidden"&&<label htmlFor={`${variant}-${f.name}`}>{f.label}{f.required&&<span className="text-red-600" aria-label="required"> *</span>}</label>}
 {f.type==="select"?<select id={`${variant}-${f.name}`} name={f.name} defaultValue={f.defaultValue??""} required={f.required} aria-invalid={!!issues[f.name]}>{!f.defaultValue&&<option value="">Select an option</option>}{(f.options??[]).map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select>:f.type==="textarea"?<textarea id={`${variant}-${f.name}`} name={f.name} defaultValue={f.defaultValue??""} placeholder={f.placeholder} required={f.required} aria-invalid={!!issues[f.name]}/>:<input id={`${variant}-${f.name}`} name={f.name} type={f.type??"text"} defaultValue={f.defaultValue??""} required={f.required} placeholder={f.placeholder} aria-invalid={!!issues[f.name]} autoComplete={f.type==="password"?f.name==="current"?"current-password":"new-password":undefined} min={f.type==="number"?0:undefined} onChange={f.type==="password"?e=>{if(["password","next"].includes(f.name))setPw(e.target.value)}:undefined}/>}
 {issues[f.name]&&<p role="alert" className="text-xs text-red-700 mt-1">{issues[f.name]}</p>}
 {f.type==="password"&&["password","next"].includes(f.name)&&<div className="mt-2"><div className="progress"><div className={score>=5?"w-full":score>=3?"w-1/2":"w-1/6"}/></div><p className="field-note">Strength: {score>=5?"strong":score>=3?"moderate":"weak"} · 12+ chars, mixed case, digit and symbol</p></div>}
 </div>)}</div>
 {issues.form&&<p role="alert" className="text-xs text-red-700">{issues.form}</p>}
 {message&&<div role="status" aria-live="polite" className={`alert ${error?"alert-error":""}`}>{message}</div>}
 <button type="submit" disabled={pending} aria-busy={pending} className="btn">{pending?"Processing…":submitLabel}</button>
 </form>
}
