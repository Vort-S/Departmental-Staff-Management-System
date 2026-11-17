import "server-only";
import {cookies} from "next/headers";
import {and,eq,isNull} from "drizzle-orm";
import {db} from "@/db/client";
import {sessions,users,staff} from "@/db/schema";
import {randomToken,tokenDigest} from "./security";
import {isExpired} from "./rules";
import {env} from "./env";
import {redirect} from "next/navigation";
const cookieName=()=>process.env.NODE_ENV==="production"?"__Host-dsms":"dsms-dev";
const hintName=()=>process.env.NODE_ENV==="production"?"__Host-dsms-hint":"dsms-hint-dev";
const cookieOpts=()=>({httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax" as const,path:"/"});
export async function createSession(user:typeof users.$inferSelect){
 await clearSession();const raw=randomToken(),now=new Date();await db.insert(sessions).values({idHash:tokenDigest(raw),userId:user.id,createdAt:now,lastSeenAt:now,absoluteExpiresAt:new Date(now.getTime()+12*3600_000)});
 const exp=now.getTime()+5*60_000,payload=`${user.role}.${exp}`;const c=await cookies();c.set(cookieName(),raw,{...cookieOpts(),maxAge:12*3600});c.set(hintName(),`${payload}.${tokenDigest(payload)}`,{...cookieOpts(),maxAge:300});
}
export async function clearSession(){const c=await cookies();const raw=c.get(cookieName())?.value;if(raw)await db.update(sessions).set({revokedAt:new Date()}).where(eq(sessions.idHash,tokenDigest(raw)));c.delete(cookieName());c.delete(hintName());}
export async function getUser(){const c=await cookies(),raw=c.get(cookieName())?.value;if(!raw||raw.length>200)return null;
 const [row]=await db.select({session:sessions,user:users}).from(sessions).innerJoin(users,eq(users.id,sessions.userId)).where(and(eq(sessions.idHash,tokenDigest(raw)),isNull(sessions.revokedAt),eq(users.status,"ACTIVE"),isNull(users.archivedAt))).limit(1);
 if(!row)return null;
 const now=new Date();if(now>=row.session.absoluteExpiresAt||isExpired(row.session.createdAt,row.session.lastSeenAt,now)){return null;}
 if(now.getTime()-row.session.lastSeenAt.getTime()>5*60_000)await db.update(sessions).set({lastSeenAt:now}).where(eq(sessions.idHash,row.session.idHash));
 return row.user;
}
export async function requireUser(){const user=await getUser();if(!user)redirect("/login");if(user.forcePasswordChange)redirect("/change-password");return user;}
export async function requireRole(roles:Array<typeof users.$inferSelect.role>){const user=await requireUser();if(!roles.includes(user.role))redirect("/dashboard");return user;}
export async function myStaff(userId:string){const [item]=await db.select().from(staff).where(eq(staff.userId,userId)).limit(1);return item??null;}
export async function revokeAll(userId:string){await db.update(sessions).set({revokedAt:new Date()}).where(and(eq(sessions.userId,userId),isNull(sessions.revokedAt)));}
// Stateless per-session CSRF token; a cross-site page cannot read it.
export async function csrfForCurrentSession(){const c=await cookies();const raw=c.get(cookieName())?.value;if(!raw||!await getUser())return null;return tokenDigest(`csrf:${raw}:${new Date().toISOString().slice(0,10)}`)}
