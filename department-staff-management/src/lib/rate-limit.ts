import {db} from "@/db/client";
import {rateLimits} from "@/db/schema";
import {sql} from "drizzle-orm";
import {tokenDigest} from "./security";
// Atomic upsert prevents two concurrent requests from both passing the same limit.
export async function checkRateLimit(bucket:string,identifier:string,limit:number,windowMs:number,blockMs:number){
 const keyHash=tokenDigest(`${bucket}:${identifier}`),now=new Date(),boundary=new Date(now.getTime()-windowMs),blocked=new Date(now.getTime()+blockMs);
 const [r]=await db.insert(rateLimits).values({keyHash,hits:1,windowStart:now})
 .onConflictDoUpdate({target:rateLimits.keyHash,set:{
  hits:sql`CASE WHEN ${rateLimits.windowStart} < ${boundary} THEN 1 ELSE ${rateLimits.hits} + 1 END`,
  windowStart:sql`CASE WHEN ${rateLimits.windowStart} < ${boundary} THEN ${now} ELSE ${rateLimits.windowStart} END`,
  blockedUntil:sql`CASE WHEN ${rateLimits.blockedUntil} > ${now} THEN ${rateLimits.blockedUntil} WHEN ${rateLimits.windowStart} >= ${boundary} AND ${rateLimits.hits} + 1 > ${limit} THEN ${blocked} ELSE NULL END`
 }}).returning();
 return !(r.hits>limit||(r.blockedUntil&&r.blockedUntil>now));
}
