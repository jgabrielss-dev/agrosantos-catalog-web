import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co', // Autoriza qualquer projeto do Supabase
        port: '',
        pathname: '/storage/v1/object/public/**', // Autoriza os buckets públicos
      },
    ],
  },
};

export default nextConfig;