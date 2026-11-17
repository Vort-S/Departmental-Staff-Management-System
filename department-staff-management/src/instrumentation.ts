// Invoked during server startup, before handlers accept requests.
export async function register(){if(process.env.NEXT_RUNTIME==="nodejs"){const {env}=await import("@/lib/env");env();}}
