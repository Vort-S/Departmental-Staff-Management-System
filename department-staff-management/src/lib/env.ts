import {z} from "zod";
const schema=z.object({DATABASE_URL:z.string().startsWith("postgresql://"),SESSION_SECRET:z.string().min(43),FIELD_ENCRYPTION_KEY:z.string().min(43),APP_URL:z.url(),RESEND_API_KEY:z.string().optional(),MAIL_FROM:z.string().optional(),ALLOWED_URL_HOSTS:z.string().min(1)});
let cached:z.infer<typeof schema>|undefined;
export function env(){
 if(!cached){
  // Preview deployments have a unique origin. Use that exact Vercel host for
  // same-origin validation and generated links instead of the production URL.
  const previewOrigin=process.env.VERCEL_ENV==="preview"&&process.env.VERCEL_URL?`https://${process.env.VERCEL_URL}`:undefined;
  cached=schema.parse({...process.env,APP_URL:process.env.APP_URL||previewOrigin});
  const bytes=Buffer.from(cached.FIELD_ENCRYPTION_KEY,"base64");
  if(bytes.length!==32)throw new Error("FIELD_ENCRYPTION_KEY must decode to 32 bytes");
  const requiresEmail=process.env.VERCEL_ENV==="production"||(!process.env.VERCEL_ENV&&process.env.NODE_ENV==="production");
  if(requiresEmail&&(!cached.RESEND_API_KEY||!cached.MAIL_FROM))throw new Error("Email provider configuration is required in production");
 }
 return cached;
}
