import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone only when requested (avoids Windows symlink EPERM issues locally).
  // In Docker/IBM Cloud build we set NEXT_OUTPUT=standalone.
  ...(process.env.NEXT_OUTPUT === "standalone" ? { output: "standalone" } : {}),
};

export default nextConfig;
