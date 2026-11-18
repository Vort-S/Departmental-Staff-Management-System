import "./globals.css";
import type {Metadata} from "next";

const siteUrl="https://department-staff-management.vercel.app";
export const metadata:Metadata={
  metadataBase:new URL(siteUrl),
  title:{default:"Departmental Staff Management System",template:"%s | DSMS"},
  description:"Manage departmental staff records, teaching assignments, leave requests and administrative approvals in a secure university workspace.",
  applicationName:"Departmental Staff Management System",
  openGraph:{type:"website",url:siteUrl,siteName:"DSMS",title:"Departmental Staff Management System",description:"University staff records, teaching allocations and leave workflows in one workspace."},
  twitter:{card:"summary",title:"Departmental Staff Management System",description:"Manage staff records, teaching and leave in one departmental workspace."},
  icons:{icon:"/icon.svg"},
};
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body><a href="#main" className="skip-link">Skip to main content</a>{children}</body></html>;
}
