import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client-runtime-utils", "@prisma/adapter-pg", "pg"],
};

export default nextConfig;
