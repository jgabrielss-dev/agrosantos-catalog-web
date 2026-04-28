/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'kuhqbygmfamaqvsefyfv.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/catalog-images/**',
      },
    ],
  },
};

export default nextConfig;