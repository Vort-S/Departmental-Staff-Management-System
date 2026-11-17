import "dotenv/config";
import {and,eq} from "drizzle-orm";
import {db,pool} from "../src/db/client";
import {departments,users,staff,courses,courseAssignments,leaveBalances,leaveRequests,leaveHistory,announcements,attendance,publications,appraisals} from "../src/db/schema";
import {hashPassword,crypt} from "../src/lib/security";
import {password} from "../src/lib/validators";
async function main(){
 if(process.env.NODE_ENV==="production")throw Error("Refusing to seed a production environment");
 const adminPassword=password.parse(process.env.SEED_ADMIN_PASSWORD),hodPassword=password.parse(process.env.SEED_HOD_PASSWORD),staffPassword=password.parse(process.env.SEED_STAFF_PASSWORD);
 await db.insert(departments).values({name:"Demo Department of Computer Science",code:"CSC-DEMO"}).onConflictDoNothing();
 const [dept]=await db.select().from(departments).where(eq(departments.code,"CSC-DEMO"));if(!dept)throw Error("Demo department missing");
 const passwords={ADMIN:await hashPassword(adminPassword),HOD:await hashPassword(hodPassword),STAFF:await hashPassword(staffPassword)};
 const accounts=[{code:"CSC/0001",email:"admin@example.edu",role:"ADMIN" as const,name:"Demo Department Administrator",rank:"Administrative Officer",staffType:"NON_ACADEMIC" as const},{code:"CSC/0002",email:"hod@example.edu",role:"HOD" as const,name:"Demo Head of Department",rank:"Professor",staffType:"ACADEMIC" as const},...Array.from({length:25},(_,i)=>({code:`CSC/${String(i+3).padStart(4,"0")}`,email:`staff${String(i+1).padStart(2,"0")}@example.edu`,role:"STAFF" as const,name:`Demo Staff ${String(i+1).padStart(2,"0")}`,rank:["Senior Lecturer","Lecturer I","Lecturer II","Technologist","Administrative Officer","Research Fellow","Assistant Lecturer"][i%7],staffType:i%5===3||i%5===4?"NON_ACADEMIC" as const:"ACADEMIC" as const}))];
 const members=[] as Array<{staffId:string,userId:string,rank:string}>;
 for(const [index,a] of accounts.entries()){
  await db.insert(users).values({email:a.email,departmentId:dept.id,passwordHash:passwords[a.role],role:a.role,status:"ACTIVE",emailVerifiedAt:new Date("2026-01-01T00:00:00Z"),forcePasswordChange:true,requestedStaffId:a.code}).onConflictDoNothing();
  const [u]=await db.select().from(users).where(eq(users.email,a.email));
  await db.insert(staff).values({staffId:a.code,userId:u.id,departmentId:dept.id,fullName:a.name,rank:a.rank,staffType:a.staffType,status:index===10?"ON_LEAVE":"ACTIVE",appointedOn:`${2015+index%10}-09-01`,qualifications:index===0?"B.Sc. Management":"Ph.D. / M.Sc. (fictional)",specialization:index%2===0?"Software Engineering, Security":"Artificial Intelligence, Data Systems",unit:index%3===0?"Software Engineering":index%3===1?"Data Science":"Systems",officeLocation:`Demo Block ${Math.floor(index/7)+1}, Room ${100+index}`,publicEmail:a.email,phone:null,homeAddressEncrypted:index===2?crypt("Demo address—not a real residence"):null,nationalIdEncrypted:null}).onConflictDoNothing();
  const [s]=await db.select().from(staff).where(eq(staff.staffId,a.code));members.push({staffId:s.id,userId:u.id,rank:a.rank});
  await db.insert(leaveBalances).values({staffId:s.id,year:2026,allowanceDays:28}).onConflictDoNothing();
 }
 const titles=["Introduction to Computing","Programming Fundamentals","Data Structures","Computer Architecture","Discrete Mathematics","Algorithms","Database Systems","Software Engineering","Operating Systems","Computer Networks","Information Security","Human Computer Interaction","Web Application Development","Artificial Intelligence","Machine Learning","Computer Graphics","Compiler Design","Distributed Systems","Research Methods","Final Year Project"];
 const courseRows=[] as Array<{id:string,units:number}>;
 for(const [i,title] of titles.entries()){
  const code=`CSC ${101+i*10}`;await db.insert(courses).values({departmentId:dept.id,code,title,units:i%3+2,level:(Math.floor(i/5)+1)*100,semester:i%2+1}).onConflictDoNothing();const [c]=await db.select().from(courses).where(and(eq(courses.departmentId,dept.id),eq(courses.code,code)));courseRows.push({id:c.id,units:c.units});
 }
 for(const [i,c] of courseRows.entries()){const member=members[2+i%25];await db.insert(courseAssignments).values({courseId:c.id,staffId:member.staffId,session:"2026/2027",assignedBy:members[1].userId}).onConflictDoNothing();}
 for(let i=0;i<6;i++){
  const s=members[i+2],start=`2026-11-${String(18+i).padStart(2,"0")}`,end=`2026-11-${String(20+i).padStart(2,"0")}`;
  const [existing]=await db.select().from(leaveRequests).where(and(eq(leaveRequests.staffId,s.staffId),eq(leaveRequests.startDate,start)));
  if(!existing){const status=i%3===0?"APPROVED" as const:"PENDING" as const;const [r]=await db.insert(leaveRequests).values({staffId:s.staffId,type:"ANNUAL",startDate:start,endDate:end,reason:"Demo sample leave request; no real personal circumstances.",status,decidedBy:status==="APPROVED"?members[1].userId:null}).returning();await db.insert(leaveHistory).values({requestId:r.id,actorId:s.userId,toStatus:"PENDING",comment:"Sample request"});if(status==="APPROVED")await db.insert(leaveHistory).values({requestId:r.id,actorId:members[1].userId,fromStatus:"PENDING",toStatus:"APPROVED",comment:"Sample approval"});}
 }
 for(const [i,title] of ["Welcome to the department portal","2026/2027 teaching timetable","Research seminar series","Staff meeting reminder"].entries()){
  const [ex]=await db.select().from(announcements).where(and(eq(announcements.departmentId,dept.id),eq(announcements.title,title)));
  if(!ex)await db.insert(announcements).values({departmentId:dept.id,authorId:members[0].userId,title,body:`This is a fictional notice for the semester project demo (${i+1}).`});
 }
 for(let i=2;i<13;i++){await db.insert(attendance).values({staffId:members[i].staffId,date:"2026-11-16",status:i%4===0?"REMOTE":"PRESENT",recordedBy:members[0].userId,duty:"Demo departmental duty"}).onConflictDoNothing();}
 for(let i=2;i<9;i++){const [existing]=await db.select().from(publications).where(and(eq(publications.staffId,members[i].staffId),eq(publications.title,`Demo research contribution ${i}`))).limit(1);if(!existing)await db.insert(publications).values({staffId:members[i].staffId,category:i%3===0?"GRANT":"PUBLICATION",title:`Demo research contribution ${i}`,year:2026});}
 for(let i=3;i<7;i++){const [existing]=await db.select().from(appraisals).where(and(eq(appraisals.staffId,members[i].staffId),eq(appraisals.period,"2026-1"))).limit(1);if(!existing)await db.insert(appraisals).values({staffId:members[i].staffId,recordedBy:members[1].userId,period:"2026-1",rating:i%5+1,notes:"Fictional appraisal for an example staff record."});}
 console.info("Demo dataset seeded: 1 admin, 1 HOD, 25 staff, 20 courses. No credentials printed.");
}
main().then(()=>pool.end()).catch(async e=>{console.error("Seed failed (no secret details displayed)");await pool.end();process.exitCode=1;});
