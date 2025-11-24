import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Stable features (formerly experimental)
  bundlePagesRouterDependencies: true,

  // Router cache configuration
  experimental: {
    staleTimes: {
      dynamic: 0,
      static: 60,
    },
  },

  // Custom headers for cache control
  async headers() {
    return [
      {
        // Apply to attendance routes
        source: "/attendance/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, max-age=0",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
