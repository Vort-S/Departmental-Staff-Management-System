import type {SVGProps} from "react";
/** The two sails of a brig form a B above its hull. */
export function BrigMark({className,...props}:SVGProps<SVGSVGElement>){
 return <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true" focusable="false" {...props}>
  <rect width="64" height="64" rx="15" fill="#11243A"/>
  <path d="M24 12v33M29 12v32" stroke="#DFBE78" strokeWidth="2" strokeLinecap="round"/>
  <path d="M26 15c9 1 15 5 15 10s-6 8-15 8V15Z" fill="#D3AB5E"/>
  <path d="M31 31c12 1 17 5 17 10s-8 8-17 8V31Z" fill="#E6C989"/>
  <path d="M15 26c-1 8-2 14-5 20l14-2V17l-9 9Z" fill="#BB8E3C"/>
  <path d="M10 49c11-2 25-1 45-2-5 7-14 11-26 10-9-.6-15-3-19-8Z" fill="#D3AB5E"/>
  <path d="M12 49c12 2 28 2 42-2M14 53c13 5 26 5 37 0" stroke="#FAE8B9" strokeWidth="1.6" strokeLinecap="round"/>
 </svg>;
}
export function BrigBrand({inverse=false,compact=false}:{inverse?:boolean;compact?:boolean}){
 return <span className={`brig-brand${inverse?" brig-brand--inverse":""}`}>
  <BrigMark className={compact?"brig-brand-icon brig-brand-icon--compact":"brig-brand-icon"}/><span className="brig-wordmark">Brig</span>
 </span>;
}