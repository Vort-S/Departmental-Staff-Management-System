import "dotenv/config";
import {db,pool} from "../src/db/client";
import {staff} from "../src/db/schema";
import {eq} from "drizzle-orm";
import {crypt,decrypt} from "../src/lib/security";
async function main(){const oldKey=Buffer.from(process.env.OLD_FIELD_ENCRYPTION_KEY??"","base64"),newKey=Buffer.from(process.env.NEW_FIELD_ENCRYPTION_KEY??"","base64");if(oldKey.length!==32||newKey.length!==32)throw Error("OLD/NEW_FIELD_ENCRYPTION_KEY must be 32-byte base64 keys");if(oldKey.equals(newKey))throw Error("New key must differ");
 const records=await db.select({id:staff.id,address:staff.homeAddressEncrypted,national:staff.nationalIdEncrypted,emergency:staff.emergencyContactEncrypted}).from(staff);
 // Transactional rotation: any failure rolls back all updates. Protect both keys and DB backups.
 await db.transaction(async tx=>{for(const r of records){const rotate=(x:string|null)=>x?crypt(decrypt(x,oldKey),newKey):null;await tx.update(staff).set({homeAddressEncrypted:rotate(r.address),nationalIdEncrypted:rotate(r.national),emergencyContactEncrypted:rotate(r.emergency)}).where(eq(staff.id,r.id));}});
 console.info("Encryption-key rewrap complete. Update FIELD_ENCRYPTION_KEY to the new key in all environments; then retire the old key securely.");
}
main().then(()=>pool.end()).catch(async()=>{console.error("Rotation failed; transaction rolled back. No secret displayed.");await pool.end();process.exitCode=1});
