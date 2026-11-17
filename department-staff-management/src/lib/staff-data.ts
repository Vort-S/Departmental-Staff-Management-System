import "server-only";
import {and,or,eq,ilike,isNull,count,asc,sql} from "drizzle-orm";
import {db} from "@/db/client";
import {staff,users} from "@/db/schema";
import type {User} from "./rules";
import {staffSearchSchema} from "./validators";
import {canReadSensitive} from "./rules";
import {audit} from "./audit";
export const publicColumns={id:staff.id,staffId:staff.staffId,fullName:staff.fullName,rank:staff.rank,staffType:staff.staffType,status:staff.status,appointedOn:staff.appointedOn,qualifications:staff.qualifications,specialization:staff.specialization,unit:staff.unit,officeLocation:staff.officeLocation,publicEmail:staff.publicEmail,photoUrl:staff.photoUrl};
export async function staffDirectory(viewer:User,filters:unknown){const s=staffSearchSchema.parse(filters),terms=[eq(staff.departmentId,viewer.departmentId),isNull(staff.archivedAt)];if(s.q)terms.push(or(ilike(staff.fullName,`%${s.q}%`),ilike(staff.staffId,`%${s.q}%`),ilike(staff.rank,`%${s.q}%`),ilike(staff.specialization,`%${s.q}%`))!);if(s.type!=="ALL")terms.push(eq(staff.staffType,s.type));if(s.status!=="ALL")terms.push(eq(staff.status,s.status));if(s.unit)terms.push(eq(staff.unit,s.unit));const where=and(...terms);const order=s.sort==="rank"?asc(staff.rank):s.sort==="id"?asc(staff.staffId):asc(staff.fullName);const [rows,totals]=await Promise.all([db.select(publicColumns).from(staff).where(where).orderBy(order).limit(12).offset((s.page-1)*12),db.select({count:count()}).from(staff).where(where)]);return {rows,total:totals[0]?.count??0,filters:s};}
export async function getStaff(viewer:User,id:string){const [row]=await db.select({...publicColumns,departmentId:staff.departmentId,userId:staff.userId}).from(staff).where(and(eq(staff.id,id),eq(staff.departmentId,viewer.departmentId),isNull(staff.archivedAt))).limit(1);if(!row)return null;
 return {...row,canRevealPhone:canReadSensitive(viewer,row,"phone"),canRevealDob:canReadSensitive(viewer,row,"dateOfBirth"),canReveal:canReadSensitive(viewer,row,"nationalId")};}
export async function adminAccounts(viewer:User){if(viewer.role!=="ADMIN")throw new Error("Forbidden");return db.select({id:users.id,email:users.email,role:users.role,status:users.status,requestedStaffId:users.requestedStaffId,emailVerifiedAt:users.emailVerifiedAt,createdAt:users.createdAt}).from(users).where(and(eq(users.departmentId,viewer.departmentId),isNull(users.archivedAt))).orderBy(asc(users.createdAt));}
