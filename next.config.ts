import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    const isPreview = process.env.VERCEL_ENV !== "production";
    if (!isPreview) return [];
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
};

export default nextConfig;
