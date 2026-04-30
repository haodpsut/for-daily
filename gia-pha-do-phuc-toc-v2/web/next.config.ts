import type { NextConfig } from "next";

// `next build` runs from web/ — process.cwd() = web/ root.
// Pinning Turbopack root here suppresses the "multiple lockfiles" warning
// caused by sibling repos (giapha-do-phuc-toc) under the same monorepo.
const root = process.cwd();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: root,
  turbopack: { root },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
