import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ Desactiva ESLint en "next build"
  },
  output: "export"
};

export default nextConfig;
