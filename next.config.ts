import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep Next.js scoped to this app when another lockfile exists higher up.
  turbopack: {
    root: process.cwd(),
  },
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
