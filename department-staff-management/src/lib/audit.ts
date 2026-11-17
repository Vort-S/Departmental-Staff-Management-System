import {db} from "@/db/client";
import {auditLogs,users} from "@/db/schema";
import {eq} from "drizzle-orm";
import {clientIpHash} from "./http";
// Append-only by application design AND database trigger (see migration).
export async function audit(event:string, actorId:string|null,entity?:string,entityId?:string,metadata:Record<string,string|number|boolean>={}){
  const [actor]=actorId?await db.select({departmentId:users.departmentId}).from(users).where(eq(users.id,actorId)).limit(1):[];
  await db.insert(auditLogs).values({event,actorId,departmentId:actor?.departmentId??null,entity,entityId,ipHash:await clientIpHash(),metadata});
}
