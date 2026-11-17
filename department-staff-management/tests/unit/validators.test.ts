import {describe,it,expect} from "vitest";
import {registerSchema,staffCreateSchema,staffSearchSchema,leaveSchema,courseSchema,password,safeUrl,staffId} from "../../src/lib/validators";
describe("validation",()=>{
 it("[U01] validates staff IDs and rejects unknown fields",()=>{expect(staffId.safeParse("CSC/0027").success).toBe(true);expect(staffId.safeParse("CSC';DROP TABLE").success).toBe(false);expect(registerSchema.safeParse({email:"staff@example.edu",staffId:"CSC/0123",password:"GoodSecurity!123",role:"ADMIN"}).success).toBe(false)});
 it("[U01] rejects weak passwords, bad URLs and wrong types",()=>{expect(password.safeParse("Password123!").success).toBe(false);expect(password.safeParse("GoodSecurity!123").success).toBe(true);expect(safeUrl.safeParse("javascript:alert(1)").success).toBe(false);expect(courseSchema.safeParse({code:"CSC 401",title:"Security",units:0,level:400,semester:1}).success).toBe(false)});
 it("[U01] enforces date ordering and allowlisted filters",()=>{expect(leaveSchema.safeParse({type:"ANNUAL",startDate:"2026-11-20",endDate:"2026-11-19",reason:"Testing"}).success).toBe(false);expect(staffSearchSchema.safeParse({sort:"DROP TABLE"}).success).toBe(false)});
});
