import "dotenv/config";
import {db,pool} from "../src/db/client";
import {users} from "../src/db/schema";
import {like} from "drizzle-orm";
async function main(){if(process.env.E2E_MODE!=="true"||process.env.NODE_ENV==="production"||!process.env.TEST_DATABASE_URL||process.env.DATABASE_URL!==process.env.TEST_DATABASE_URL)throw Error("Refusing setup outside isolated E2E database");await db.update(users).set({forcePasswordChange:false}).where(like(users.email,"%@example.edu"));console.info("E2E demo accounts prepared on explicitly selected test database; no passwords exposed.")}
main().then(()=>pool.end()).catch(async()=>{console.error("E2E setup failed");await pool.end();process.exitCode=1});
