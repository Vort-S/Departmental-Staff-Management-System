import "./globals.css";
import type {Metadata} from "next";

const siteUrl="https://department-staff-management.vercel.app";
export const metadata:Metadata={
  metadataBase:new URL(siteUrl),
  title:{default:"Brig",template:"%s | Brig"},
  description:"Department operations, organized. Manage staff records, course allocation and leave approvals with Brig.",
  applicationName:"Brig",
  openGraph:{type:"website",url:siteUrl,siteName:"Brig",title:"Brig",description:"Department operations, organized. Staff, teaching and leave in one place."},
  twitter:{card:"summary",title:"Brig",description:"Department operations, organized."},
  icons:{icon:"/icon.svg"},
};
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body><a href="#main" className="skip-link">Skip to main content</a>{children}</body></html>;
}
