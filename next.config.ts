import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Ignore les erreurs d'eslint au build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignore les erreurs de types au build
    ignoreBuildErrors: true,
  }
};

export default nextConfig;