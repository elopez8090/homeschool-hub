/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      "@react-email/components",
      "@react-email/render",
    ],
  },
};

export default nextConfig;
