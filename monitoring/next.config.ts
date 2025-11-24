import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "standalone",
  // Stable features (formerly experimental)
  bundlePagesRouterDependencies: true,
};

export default nextConfig;
