"use server";
import {and,eq,isNull,gt,sql} from "drizzle-orm";
import {db} from "@/db/client";
import {users,authTokens,staff} from "@/db/schema";
import {registerSchema,loginSchema,resetRequestSchema,resetSchema,verifyEmailSchema,changePasswordSchema,email} from "@/lib/validators";
import {hashPassword,verifyPassword,randomToken,tokenDigest,safeError} from "@/lib/security";
import {checkRateLimit} from "@/lib/rate-limit";
import {sendSecureEmail} from "@/lib/email";
import {assertSameOrigin,clientIpHash} from "@/lib/http";
import {audit} from "@/lib/audit";
import {createSession,clearSession,getUser,revokeAll} from "@/lib/session";
import {env} from "@/lib/env";
const response=(message:string)=>({ok:true as const,message});
async function tokenFor(userId:string,kind:"EMAIL"|"RESET",emailAddress:string){const raw=randomToken(),exp=new Date(Date.now()+(kind==="EMAIL"?24*3600_000:30*60_000));await db.insert(authTokens).values({userId,kind,tokenHash:tokenDigest(raw),expiresAt:exp});const link=new URL(kind==="EMAIL"?"/verify":"/reset",env().APP_URL);link.searchParams.set("token",raw);await sendSecureEmail(emailAddress,kind==="EMAIL"?"Verify your departmental account":"Reset your departmental password",`To ${kind==="EMAIL"?"verify your email":"reset your password"}, use this single-use link (expires soon): ${link.toString()}\nIf you did not request this, ignore this message.`)}
export async function register(input:unknown){try{await assertSameOrigin();const data=registerSchema.extend({inviteToken:verifyEmailSchema.shape.token.optional()}).parse(input);const ip=await clientIpHash();if(!await checkRateLimit("register",ip,4,3600_000,3600_000))return safeError();
  const existing=await db.select({id:users.id}).from(users).where(eq(users.email,data.email)).limit(1);if(existing.length)return response("If eligible, check your email and await activation.");
  let role:"STAFF"|"HOD"="STAFF",inviteId:string|undefined;
  if(data.inviteToken){const [invite]=await db.select().from(authTokens).where(and(eq(authTokens.tokenHash,tokenDigest(data.inviteToken)),eq(authTokens.kind,"INVITE"),eq(authTokens.email,data.email),isNull(authTokens.usedAt),gt(authTokens.expiresAt,new Date()))).limit(1);if(!invite)return safeError();role=invite.inviteRole==="HOD"?"HOD":"STAFF";inviteId=invite.id;}
  const [dept]=await db.query.departments.findMany({limit:1});if(!dept)return safeError();const hashed=await hashPassword(data.password);
  const [u]=await db.insert(users).values({departmentId:dept.id,email:data.email,requestedStaffId:data.staffId,passwordHash:hashed,role,status:"PENDING"}).returning();
  if(inviteId)await db.update(authTokens).set({usedAt:new Date()}).where(and(eq(authTokens.id,inviteId),isNull(authTokens.usedAt)));
  await tokenFor(u.id,"EMAIL",u.email);await audit("ACCOUNT_REGISTERED",u.id,"user",u.id);
  return response("Check your email to verify your account; administrator approval is also required.");
 }catch{return safeError()}}
/** Authentication feedback is deliberately specific only after a correct password.
 * Do not expose whether an email address belongs to an account on a failed login.
 */
export async function login(input:unknown){
  try {
    await assertSameOrigin();
  } catch {
    return {ok:false as const,error:"This sign-in page is out of date. Reload it and try again.",code:"REQUEST_ORIGIN"};
  }
  const parsed=loginSchema.safeParse(input);
  if(!parsed.success)return {ok:false as const,error:"Enter a valid email address and password.",code:"INVALID_INPUT"};
  const data=parsed.data;
  try {
    const ip=await clientIpHash();
    if(!await checkRateLimit("login_ip",ip,12,15*60_000,30*60_000)||!await checkRateLimit("login_account",data.email,6,15*60_000,30*60_000))
      return {ok:false as const,error:"Too many sign-in attempts. Try again in 30 minutes or use password recovery.",code:"RATE_LIMIT"};
    const [u]=await db.select().from(users).where(eq(users.email,data.email)).limit(1);
    // Preserve constant-work verification for unknown addresses to limit enumeration.
    const valid=u?await verifyPassword(u.passwordHash,data.password):await verifyPassword(await hashPassword(randomToken()),data.password);
    if(!u||!valid){
      if(u){const n=u.failedLoginCount+1;await db.update(users).set({failedLoginCount:n,lockedUntil:n>=6?new Date(Date.now()+30*60_000):null}).where(eq(users.id,u.id));}
      await audit("LOGIN_FAILED",u?.id??null,"auth");
      return {ok:false as const,error:"Email or password is incorrect. Please try again.",code:"INVALID_CREDENTIALS"};
    }
    // Account-specific status is revealed only after successfully verifying the password.
    if(u.archivedAt||u.status==="SUSPENDED")return {ok:false as const,error:"This account is unavailable. Contact your department administrator.",code:"ACCOUNT_UNAVAILABLE"};
    if(u.status==="PENDING")return {ok:false as const,error:"Your account is awaiting administrator approval.",code:"AWAITING_APPROVAL"};
    if(!u.emailVerifiedAt)return {ok:false as const,error:"Check your inbox and verify your email address before signing in.",code:"EMAIL_UNVERIFIED"};
    if(u.lockedUntil&&u.lockedUntil>new Date())return {ok:false as const,error:"This account is temporarily locked after unsuccessful attempts. Try again later or reset your password.",code:"ACCOUNT_LOCKED"};
    await db.update(users).set({failedLoginCount:0,lockedUntil:null}).where(eq(users.id,u.id));
    await createSession(u);
    await audit("LOGIN_SUCCESS",u.id,"auth");
    return response("Signed in successfully.");
  } catch (cause) {
    // Name and stable code only: never log credentials, session tokens, or account addresses.
    console.error("[auth.login] SIGN_IN_UNAVAILABLE",{kind:cause instanceof Error?cause.name:"UnknownError"});
    return {ok:false as const,error:"Sign-in is temporarily unavailable. Please try again. If the issue continues, contact the administrator (SIGN_IN_UNAVAILABLE).",code:"SIGN_IN_UNAVAILABLE"};
  }
}
export async function logout(){try{await assertSameOrigin();const u=await getUser();await clearSession();if(u)await audit("LOGOUT",u.id,"auth");return response("Signed out.")}catch{return safeError()}}
export async function logoutAll(){try{await assertSameOrigin();const u=await getUser();if(!u)return safeError();await revokeAll(u.id);await clearSession();await audit("ALL_SESSIONS_REVOKED",u.id,"auth");return response("All devices signed out.")}catch{return safeError()}}
export async function requestReset(input:unknown){try{await assertSameOrigin();const {email:address}=resetRequestSchema.parse(input),ip=await clientIpHash();if(!await checkRateLimit("reset",ip,4,3600_000,3600_000))return response("If the account exists, instructions will be emailed.");const [u]=await db.select().from(users).where(eq(users.email,address)).limit(1);if(u&&u.status==="ACTIVE")await tokenFor(u.id,"RESET",u.email);return response("If the account exists, instructions will be emailed.")}catch{return response("If the account exists, instructions will be emailed.")}}
export async function resetPassword(input:unknown){try{await assertSameOrigin();const data=resetSchema.parse(input),now=new Date();const [t]=await db.update(authTokens).set({usedAt:now}).where(and(eq(authTokens.tokenHash,tokenDigest(data.token)),eq(authTokens.kind,"RESET"),isNull(authTokens.usedAt),gt(authTokens.expiresAt,now))).returning();if(!t?.userId)return safeError();await db.update(users).set({passwordHash:await hashPassword(data.password),failedLoginCount:0,lockedUntil:null,forcePasswordChange:false}).where(eq(users.id,t.userId));await revokeAll(t.userId);await audit("PASSWORD_RESET",t.userId,"auth");return response("Password updated. Please log in.");}catch{return safeError()}}
export async function verifyEmail(input:unknown){try{await assertSameOrigin();const {token}=verifyEmailSchema.parse(input),now=new Date();const [t]=await db.update(authTokens).set({usedAt:now}).where(and(eq(authTokens.tokenHash,tokenDigest(token)),eq(authTokens.kind,"EMAIL"),isNull(authTokens.usedAt),gt(authTokens.expiresAt,now))).returning();if(!t?.userId)return safeError();await db.update(users).set({emailVerifiedAt:now}).where(eq(users.id,t.userId));await audit("EMAIL_VERIFIED",t.userId,"auth");return response("Email verified. Wait for administrator approval if pending.")}catch{return safeError()}}
export async function resendVerification(input:unknown){try{await assertSameOrigin();const {email:address}=resetRequestSchema.parse(input),ip=await clientIpHash();if(!await checkRateLimit("verify_resend",ip,4,3600_000,3600_000))return response("If eligible, a verification link will arrive.");const [u]=await db.select().from(users).where(eq(users.email,address)).limit(1);if(u&&!u.emailVerifiedAt)await tokenFor(u.id,"EMAIL",u.email);return response("If eligible, a verification link will arrive.")}catch{return response("If eligible, a verification link will arrive.")}}
export async function changePassword(input:unknown){try{await assertSameOrigin();const d=changePasswordSchema.parse(input);const next=d.next;const u=await getUser();if(!u||!d.current||!await verifyPassword(u.passwordHash,d.current))return safeError();await db.update(users).set({passwordHash:await hashPassword(next),forcePasswordChange:false}).where(eq(users.id,u.id));await revokeAll(u.id);await clearSession();await audit("PASSWORD_CHANGED",u.id,"auth");return response("Password changed. Log in again.");}catch{return safeError()}}
