"use client";
import {useState,useTransition} from "react";
import {revealSensitive} from "@/actions/staff";
export function SensitiveReveal({id,field,label}:{id:string,field:"nationalId"|"homeAddress"|"emergencyContact"|"phone"|"dateOfBirth",label:string}){const [value,setValue]=useState<string|null>(null),[pending,start]=useTransition();return <div className="flex items-start gap-3 flex-wrap"><div><p className="muted text-xs mb-1">{label}</p><p className="break-all font-semibold">{value??"••••••••"}</p></div><button className="btn btn-outline !py-1 !px-2 !text-xs" disabled={pending} onClick={()=>{if(value){setValue(null);return}start(async()=>{const r=await revealSensitive({id,field});setValue(r.ok?r.value:"Not authorized")})}}>{pending?"Checking…":value?"Hide":"Reveal"}</button></div>}
