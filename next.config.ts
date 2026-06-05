import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["lh3.googleusercontent.com"],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
      {
        protocol: 'https',
        hostname: 'randomuser.me',
      },
      {
        protocol: 'https',
        hostname: 'crmbackend.bytebuzz.in',
      },
      {
        protocol: 'https',
        hostname: 'api.bytebuzz.in',
      },
      {
        protocol: 'https',
        hostname: 'hrms.bytebuzz.in',
      }
    ],
  },
};

export default nextConfig;
