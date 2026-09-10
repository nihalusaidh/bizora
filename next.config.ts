import type { NextConfig } from "next";

const isCapacitor = process.env.CAPACITOR === "true";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  output: isCapacitor ? "export" : undefined,
  images: {
    unoptimized: isCapacitor,
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "*.supabase.in" },
    ],
  },
  ...(isCapacitor && {
    trailingSlash: true,
    distDir: "out",
  }),
};

export default nextConfig;
