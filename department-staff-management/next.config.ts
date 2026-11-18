import type { NextConfig } from "next";
const nextConfig:NextConfig = {reactStrictMode:true, poweredByHeader:false, productionBrowserSourceMaps:false, serverExternalPackages:["@node-rs/argon2"], images:{remotePatterns:[{protocol:"https",hostname:"images.unsplash.com"}],formats:["image/avif","image/webp"]}, experimental:{serverActions:{bodySizeLimit:"1mb"}}};
export default nextConfig;
