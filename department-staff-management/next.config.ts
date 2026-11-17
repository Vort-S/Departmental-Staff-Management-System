import type { NextConfig } from "next";
const nextConfig:NextConfig = {reactStrictMode:true, poweredByHeader:false, productionBrowserSourceMaps:false, serverExternalPackages:["@node-rs/argon2"], experimental:{serverActions:{bodySizeLimit:"1mb"}}};
export default nextConfig;
