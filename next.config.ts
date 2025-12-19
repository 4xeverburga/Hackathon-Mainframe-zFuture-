import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Needed for container deploys (smaller image + faster cold start).
  output: "standalone",
};

export default nextConfig;
