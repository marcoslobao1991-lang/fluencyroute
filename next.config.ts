import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/aula-vsl', destination: '/vsl', permanent: true },
    ]
  },
};

export default nextConfig;
