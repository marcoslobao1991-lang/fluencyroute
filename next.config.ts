import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/aula-vsl', destination: '/vsl2', permanent: true },
      { source: '/rota-fluencia', destination: '/vsl', permanent: true },
      { source: '/rota-fluencia/checkout', destination: '/subscribe', permanent: true },
    ]
  },
};

export default nextConfig;
