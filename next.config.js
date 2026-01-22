/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { dev }) => {
    if (dev) {
      config.devtool = 'source-map';
    }
    return config;
  },

  // Turbopack configuration for Next.js 16
  turbopack: {},

  // Optimize build performance - moved from experimental in Next.js 15
  serverExternalPackages: ['@prisma/client'],

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
      {
        protocol: "https",
        hostname: "cdn-icons-png.flaticon.com",
      },
    ],
  },
};

module.exports = nextConfig;
