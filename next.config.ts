import type { NextConfig } from "next";

const isCapacitor = process.env.CAPACITOR === "true";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  output: isCapacitor ? "export" : undefined,
  compress: true,
  turbopack: {},
  images: {
    unoptimized: isCapacitor,
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "*.supabase.in" },
      { protocol: "https", hostname: "*.supabase.storage" },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "@google/genai",
      "zustand",
    ],
  },
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-XSS-Protection", value: "1; mode=block" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      ],
    },
  ],
  ...(isCapacitor && {
    trailingSlash: true,
    distDir: "out",
  }),
};

export default nextConfig;
