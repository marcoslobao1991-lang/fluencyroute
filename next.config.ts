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
  async rewrites() {
    return {
      // beforeFiles vence a rota app/bridge — serve a versão estática leve (42KB vs 691KB)
      beforeFiles: [
        { source: '/bridge', destination: '/bridge.html' },
        { source: '/bridge2', destination: '/bridge.html' },
      ],
      afterFiles: [
        { source: '/manu', destination: '/manu.html' },
        { source: '/lead', destination: '/funil/comecar.html' },
        { source: '/treino', destination: '/funil/treino.html' },
        { source: '/treino-ultra', destination: '/funil/treino-ultra.html' },
      ],
      fallback: [],
    }
  },
};

export default nextConfig;
