import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Evita o "streaming metadata": com ele, tags como <link rel="manifest"> iam para o
  // <body> e o Chrome ignorava (bloqueando a instalação do PWA). Assim ficam no <head>.
  htmlLimitedBots: /.*/,
  allowedDevOrigins: ['192.168.0.103', '192.168.0.100', '192.168.0.104', 'localhost', '127.0.0.1'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
  },
};

export default nextConfig;
