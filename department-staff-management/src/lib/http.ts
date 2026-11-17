import {headers} from "next/headers";
import {env} from "./env";
import {tokenDigest} from "./security";
export async function assertSameOrigin(){const h=await headers();const origin=h.get("origin");const expected=new URL(env().APP_URL).origin;if(!origin||origin!==expected)throw new Error("Forbidden origin");}
export async function clientIpHash(){const h=await headers();const ip=h.get("x-vercel-forwarded-for")?.split(",")[0]?.trim()??h.get("x-real-ip")??h.get("x-forwarded-for")?.split(",")[0]?.trim()??"unknown";return tokenDigest(`ip:${ip}`)}
export function allowlistedUrl(raw:string){const u=new URL(raw);const hosts=env().ALLOWED_URL_HOSTS.split(",").map(x=>x.trim().toLowerCase()).filter(Boolean);if(!["http:","https:"].includes(u.protocol)||u.username||u.password||!hosts.includes(u.hostname.toLowerCase())||u.port)throw new Error("Unsupported URL host");if(process.env.NODE_ENV==="production"&&u.protocol!=="https:")throw new Error("HTTPS required");return u.toString()}
export const formResult=(ok:boolean,message:string)=>({ok,message});
