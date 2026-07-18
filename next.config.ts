import type { NextConfig } from "next";

const apiOrigin = process.env.API_ORIGIN?.replace(/\/+$/, '')

if (!apiOrigin) {
  throw new Error('API_ORIGIN is required to configure the backend gateway')
}

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination: `${apiOrigin}/api/:path*`,
      },
    ]
  },
};

export default nextConfig;
