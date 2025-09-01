import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  output: "export",
  basePath: '/bioethics-hook-game', 
  assetPrefix: '/bioethics-hook-game/'
};

export default nextConfig;
