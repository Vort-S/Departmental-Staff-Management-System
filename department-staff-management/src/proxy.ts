import {NextRequest,NextResponse} from "next/server";
// Proxy is an optimistic first gate. Server and database authorization is mandatory.
const restricted=["/dashboard","/profile","/staff","/courses","/leave","/attendance","/documents","/publications","/appraisals","/announcements","/reports","/admin","/change-password"];
export async function proxy(request:NextRequest){
 const nonce=crypto.randomUUID().replaceAll("-","");const isDev=process.env.NODE_ENV!=="production";
 const csp=["default-src 'self'",`script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev?" 'unsafe-eval'":""}`,`style-src 'self' 'nonce-${nonce}'${isDev?" 'unsafe-inline'":""}`,"img-src 'self' data: https:","font-src 'self'", `connect-src 'self'${isDev?" ws://localhost:*":""}`, "object-src 'none'", "base-uri 'self'", "form-action 'self'", "frame-ancestors 'none'", "upgrade-insecure-requests"].join("; ");
 const headers=new Headers(request.headers);headers.set("x-nonce",nonce);headers.set("Content-Security-Policy",csp);
 const pathname=request.nextUrl.pathname;let response:NextResponse|undefined;
 if(restricted.some(p=>pathname===p||pathname.startsWith(p+"/"))){
  const hasCookie=!!request.cookies.get(isDev?"dsms-dev":"__Host-dsms")?.value;
  if(!hasCookie)response=NextResponse.redirect(new URL("/login",request.url));
  else if(pathname.startsWith("/admin")||pathname.startsWith("/reports")){
   const hint=request.cookies.get(isDev?"dsms-hint-dev":"__Host-dsms-hint")?.value;
   if(hint){const parts=hint.split(".");if(parts.length===3){
    const [role,exp,signature]=parts;const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(process.env.SESSION_SECRET??""),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
    const calculated=Array.from(new Uint8Array(await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(`${role}.${exp}`)))).map(b=>b.toString(16).padStart(2,"0")).join("");
    if(calculated===signature&&Number(exp)>Date.now()&&!(role==="ADMIN"||pathname.startsWith("/reports")&&role==="HOD"))response=NextResponse.redirect(new URL("/dashboard",request.url));
   }}
  }
 }
 response??=NextResponse.next({request:{headers}});response.headers.set("Content-Security-Policy",csp);response.headers.set("X-Content-Type-Options","nosniff");response.headers.set("Referrer-Policy","strict-origin-when-cross-origin");response.headers.set("Permissions-Policy","camera=(), microphone=(), geolocation=()");response.headers.set("X-Frame-Options","DENY");response.headers.set("Cache-Control","no-store");if(!isDev)response.headers.set("Strict-Transport-Security","max-age=63072000; includeSubDomains; preload");return response;
}
export const config={matcher:["/((?!_next/static|_next/image|favicon.ico).*)"]};
