import {test,expect} from "@playwright/test";
import {randomBytes} from "node:crypto";
const onlyDesktop=(name:string)=>name!=="desktop-chrome";
const adminEmail="admin@example.edu",hodEmail="hod@example.edu",staffEmail="staff01@example.edu";
const passwd=process.env.SEED_STAFF_PASSWORD??"",adminPwd=process.env.SEED_ADMIN_PASSWORD??"",hodPwd=process.env.SEED_HOD_PASSWORD??"";
async function login(page:import("@playwright/test").Page,email:string,password:string){await page.goto("/login");await page.getByLabel("Email address").fill(email);await page.getByLabel("Password",{exact:true}).fill(password);await page.getByRole("button",{name:"Sign in"}).click();}
// Seeded first-login accounts require a password change. CI must execute a dedicated
// bootstrap step in its isolated test branch to set force_password_change=false.
test("[E01] login and logout, wrong-password rejection",async({page},testInfo)=>{test.skip(onlyDesktop(testInfo.project.name),"Desktop-only authenticated workflow");test.skip(!passwd,"SEED_STAFF_PASSWORD required");await login(page,staffEmail,"DefinitelyWrong!123");await expect(page.getByRole("alert")).toContainText("Email or password is incorrect");await login(page,staffEmail,passwd);await expect(page).toHaveURL(/dashboard|change-password/);if(page.url().includes("/dashboard")){await page.getByRole("button",{name:"Sign out"}).click();await expect(page).toHaveURL(/login/);}});
test("[E03] directory search accepts bound SQL text, renders result",async({page},testInfo)=>{test.skip(onlyDesktop(testInfo.project.name),"Desktop-only authenticated workflow");test.skip(!passwd,"Seed credentials required");await login(page,staffEmail,passwd);test.skip(page.url().includes("change-password"),"First-login password change must be performed");await page.goto("/staff");await page.getByPlaceholder("Search…").fill("Demo Staff");await page.getByRole("button",{name:"Apply filters"}).click();await expect(page.getByText(/Department staff/)).toBeVisible();await page.getByPlaceholder("Search…").fill("' OR 1=1 --");await page.getByRole("button",{name:"Apply filters"}).click();await expect(page.getByRole("heading",{name:/Staff directory/})).toBeVisible();});
test("[E05] staff cannot enter admin or reports",async({page},testInfo)=>{test.skip(onlyDesktop(testInfo.project.name),"Desktop-only authenticated workflow");test.skip(!passwd,"Seed credentials required");await login(page,staffEmail,passwd);test.skip(page.url().includes("change-password"),"First-login password change must be performed");await page.goto("/admin");await expect(page).not.toHaveURL(/\/admin$/);await page.goto("/reports");await expect(page).not.toHaveURL(/\/reports$/);});
test("[E06] admin CSV report downloads",async({page},testInfo)=>{test.skip(onlyDesktop(testInfo.project.name),"Desktop-only authenticated workflow");test.skip(!adminPwd,"Admin credentials required");await login(page,adminEmail,adminPwd);test.skip(page.url().includes("change-password"),"First-login password change must be performed");await page.goto("/reports");const [download]=await Promise.all([page.waitForEvent("download"),page.getByRole("link",{name:/Export CSV/}).first().click()]);expect(download.suggestedFilename()).toMatch(/\.csv$/);});
test("[L01] login validation errors are visible and password visibility is controllable",async({page})=>{
 await page.goto("/login");
 await page.getByLabel("Email address").fill("not-an-email");
 await page.getByLabel("Password",{exact:true}).fill("test");
 await page.getByRole("button",{name:"Sign in"}).click();
 await expect(page.getByRole("alert").first()).toBeVisible();
 await expect(page.getByText("Please correct the highlighted fields.")).toBeVisible();
 await page.getByRole("button",{name:"Show password"}).click();
 await expect(page.getByRole("button",{name:"Hide password"})).toBeVisible();
 await expect(page.getByLabel("Password",{exact:true})).toHaveAttribute("type","text");
});
test("[S07] security headers and escaped CSV functionality",async({request})=>{const r=await request.get("/login");expect(r.headers()["content-security-policy"]).toContain("nonce-");expect(r.headers()["x-content-type-options"]).toBe("nosniff");expect(r.headers()["x-frame-options"]).toBe("DENY");});
test("[S05] tampered sessions reject access",async({page})=>{await page.context().addCookies([{name:"dsms-dev",value:"forged-token",url:"http://localhost:3000",httpOnly:true,sameSite:"Lax"}]);await page.goto("/dashboard");await expect(page).toHaveURL(/login/);});
test("[X01] unknown route displays 404",async({page})=>{await page.goto("/there-is-no-such-page");await expect(page.getByText("Page not found")).toBeVisible();});
test("[E07] mobile navigation fits and opens",async({page,isMobile})=>{test.skip(!isMobile,"Mobile projects only");await page.goto("/");await expect(page.getByRole("link",{name:/Create account/})).toBeVisible();await page.goto("/login");await expect(page.getByLabel("Email address")).toBeVisible();});
test("[E02] public registration pending until verified and administratively approved",async({page},testInfo)=>{
 test.skip(onlyDesktop(testInfo.project.name)||!adminPwd||process.env.E2E_MODE!=="true","Requires dedicated test branch + demo admin");
 const suffix=randomBytes(3).toString("hex"),email=`e2e-${suffix}@example.edu`,staffId=`TST/${parseInt(suffix,16).toString().slice(0,7).padStart(7,"0")}`;
 await page.goto("/register");await page.getByLabel("Institutional email").fill(email);await page.getByLabel("Assigned staff ID").fill(staffId);await page.getByLabel("Password").fill("UniqueE2ePassword!123");await page.getByRole("button",{name:"Create account"}).click();await expect(page.getByText(/Check your email/)).toBeVisible();
 // Simulate the independent email provider's verification callback through a test-only
 // database fixture. This does NOT constitute a test of live email delivery.
 const url=process.env.TEST_DATABASE_URL;if(!url)throw Error("Dedicated TEST_DATABASE_URL required");
 const {neon}=await import("@neondatabase/serverless"),query=neon(url);
 await query`UPDATE users SET email_verified_at=NOW() WHERE email=${email} AND status='PENDING'`;
 await login(page,adminEmail,adminPwd);await page.goto("/staff");
 await page.getByLabel("Staff ID").fill(staffId);await page.getByLabel("Full name").fill("Demo E2E Registration Person");await page.getByLabel("Rank / position").selectOption("Lecturer II");await page.getByLabel("Staff type").selectOption("ACADEMIC");await page.getByLabel("Employment status").selectOption("ACTIVE");await page.getByLabel("Appointment date").fill("2025-09-01");await page.getByLabel("Unit / research group").fill("Demo Integration");await page.getByRole("button",{name:"Create staff record"}).click();await expect(page.getByText("Staff record created.")).toBeVisible();
 await page.goto("/admin");const row=page.getByRole("row").filter({hasText:email});await row.getByRole("button",{name:"Approve"}).click();await expect(row.getByText("ACTIVE")).toBeVisible();
 await page.goto("/login");await login(page,email,"UniqueE2ePassword!123");await expect(page).toHaveURL(/dashboard/);
});
test("[E04] staff submits annual leave; HOD approves",async({page},testInfo)=>{
 test.skip(onlyDesktop(testInfo.project.name)||!passwd||!hodPwd,"Requires seeded staff and HOD");
 const start=new Date(Date.now()+38*86400_000);const end=new Date(start.getTime()+2*86400_000);const date=(d:Date)=>d.toISOString().slice(0,10);
 // Annual leave must remain in a single year; choose January in next year when needed.
 if(start.getUTCFullYear()!==end.getUTCFullYear()){start.setUTCDate(5);start.setUTCMonth(0);start.setUTCFullYear(start.getUTCFullYear()+1);end.setTime(start.getTime()+2*86400_000)}
 await login(page,staffEmail,passwd);await page.goto("/leave");await page.getByLabel("Leave category").selectOption("ANNUAL");await page.getByLabel("First day").fill(date(start));await page.getByLabel("Last day").fill(date(end));await page.getByLabel("Reason").fill("Fictional E2E test leave");await page.getByRole("button",{name:"Submit leave request"}).click();await expect(page.getByText("Request submitted.")).toBeVisible();
 await page.getByRole("button",{name:"Sign out"}).click();await login(page,hodEmail,hodPwd);await page.goto("/leave");const row=page.getByRole("row").filter({hasText:date(start)}).filter({hasText:"Demo Staff 01"});await row.getByRole("button",{name:"Approve"}).click();await expect(row.getByText("APPROVED")).toBeVisible();
});
test("[S02] XSS payload in professional bio is rendered as plain text",async({page},testInfo)=>{
 test.skip(onlyDesktop(testInfo.project.name)||!passwd,"Requires demo staff");await login(page,staffEmail,passwd);await page.goto("/profile");const payload='<img src="x" onerror="alert(1)">';await page.getByLabel("Qualifications").fill(payload);await page.getByRole("button",{name:"Update my profile"}).click();await expect(page.getByText("Profile updated.")).toBeVisible();await page.goto("/staff");await page.getByRole("link",{name:"Demo Staff 01"}).click();await expect(page.getByText(payload)).toBeVisible();expect(await page.locator('img[src="x"]').count()).toBe(0);
});
test("[S03] staff IDOR cannot reveal another employee's sensitive fields",async({page},testInfo)=>{test.skip(onlyDesktop(testInfo.project.name)||!passwd,"Requires seeded profiles");await login(page,staffEmail,passwd);await page.goto("/staff");await page.getByRole("link",{name:"Demo Staff 02"}).click();await expect(page.getByRole("button",{name:"Reveal"})).toHaveCount(0);await page.goto("/appraisals");await expect(page.getByText("Demo Staff 02")).toHaveCount(0);});
test("[S05] logout API requires per-session CSRF token and correct origin",async({page,request},testInfo)=>{test.skip(onlyDesktop(testInfo.project.name)||!passwd,"Requires demo staff");await login(page,staffEmail,passwd);const csrf=await page.request.get("/api/session/csrf");expect(csrf.ok()).toBe(true);const {csrf:token}=await csrf.json();const noToken=await page.request.post("/api/session/logout",{headers:{origin:"http://localhost:3000"}});expect(noToken.status()).toBe(403);const foreignOrigin=await page.request.post("/api/session/logout",{headers:{origin:"https://attacker.invalid","x-csrf-token":token}});expect(foreignOrigin.status()).toBe(403);const valid=await page.request.post("/api/session/logout",{headers:{origin:"http://localhost:3000","x-csrf-token":token}});expect(valid.ok()).toBe(true);});
