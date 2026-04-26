import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.0.5', '192.168.0.0/24'],
  async redirects() {
    return [
      { source: '/aula-vsl', destination: '/vsl2', permanent: true },
      { source: '/rota-fluencia', destination: '/vsl', permanent: true },
      { source: '/rota-fluencia/checkout', destination: '/subscribe', permanent: true },
    ]
  },
};

export default nextConfig;
