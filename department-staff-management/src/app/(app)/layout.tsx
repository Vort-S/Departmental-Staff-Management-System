import {getUser} from "@/lib/session";
import {redirect} from "next/navigation";
import {Nav} from "@/components/Nav";
export const dynamic="force-dynamic";
export default async function AppLayout({children}:{children:React.ReactNode}){const user=await getUser();if(!user)redirect("/login");if(user.forcePasswordChange)redirect("/change-password");return <><Nav role={user.role} email={user.email}/><main id="main" className="layout-main p-4 sm:p-6 lg:p-9"><div className="max-w-[1240px] mx-auto">{children}</div></main></>}
