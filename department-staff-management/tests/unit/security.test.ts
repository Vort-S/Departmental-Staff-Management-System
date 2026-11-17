import {describe,it,expect} from "vitest";
import {randomBytes} from "node:crypto";
import {hashPassword,verifyPassword,crypt,decrypt,tokenDigest,randomToken} from "../../src/lib/security";
describe("cryptographic primitives",()=>{
 it("[U02] argon2id hashes and verifies without retaining a plaintext password",async()=>{const h=await hashPassword("BigTestSecret!1234");expect(h).not.toBe("BigTestSecret!1234");expect(h.startsWith("$argon2id$")).toBe(true);expect(await verifyPassword(h,"BigTestSecret!1234")).toBe(true);expect(await verifyPassword(h,"bad input")).toBe(false)});
 it("[U03] AES-256-GCM round-trips and detects tampering",()=>{const key=randomBytes(32),out=crypt("fictional secret",key);expect(out).not.toContain("fictional secret");expect(decrypt(out,key)).toBe("fictional secret");const p=out.split(".");p[3]=p[3]+"AAAA";expect(()=>decrypt(p.join("."),key)).toThrow();expect(()=>decrypt(out,randomBytes(32))).toThrow()});
 it("[U03] token digests are deterministic but raw tokens are random",()=>{const one=randomToken(),two=randomToken();expect(one).not.toBe(two);expect(tokenDigest(one,"test-secret")).toHaveLength(64);expect(tokenDigest(one,"test-secret")).toBe(tokenDigest(one,"test-secret"))});
});
