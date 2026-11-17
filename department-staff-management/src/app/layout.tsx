import "./globals.css";
import type {Metadata} from "next";
export const metadata:Metadata={title:{default:"DSMS | Departmental Staff Management",template:"%s | DSMS"},description:"Secure departmental staff administration, course allocation and leave workflows."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
