import {env} from "./env";
export async function sendSecureEmail(to:string,subject:string,body:string){
 if(process.env.E2E_MODE==="true"&&process.env.NODE_ENV!=="production"&&!process.env.VERCEL)return; // Test-only transport: does not expose or log links.
 const cfg=env();if(!cfg.RESEND_API_KEY||!cfg.MAIL_FROM)throw new Error("Email transport unavailable");
 const res=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${cfg.RESEND_API_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({from:cfg.MAIL_FROM,to:[to],subject,text:body}),cache:"no-store"});
 if(!res.ok)throw new Error("Email provider refused message");
}
