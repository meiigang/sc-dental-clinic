import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'oxbkwpsoxbmypxiwsmul.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/profile-pictures/**',
      },
    ],
    domains: [
      'oxbkwpsoxbmypxiwsmul.supabase.co',
    ],
  },
  
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:4000/api/:path*',
      },
    ];
  },
};

export default nextConfig;
