import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Node >=22.12 resolves @swc/helpers through the `module-sync` export
  // condition (esm/*), while output file tracing only follows the `default`
  // one (cjs/*). Without this the standalone build ships no esm/ files and
  // crashes at boot with MODULE_NOT_FOUND on @swc/helpers/esm/*.
  outputFileTracingIncludes: {
    "**/*": ["./node_modules/.pnpm/@swc+helpers@*/node_modules/@swc/helpers/esm/**"],
  },
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ]
  },
};

export default nextConfig;
