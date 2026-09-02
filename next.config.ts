import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@base-ui/react"],
  serverExternalPackages: ["bcryptjs"],
};

export default nextConfig;
