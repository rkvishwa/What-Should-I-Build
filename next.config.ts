import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "frame-src 'self' https://*.v0.dev https://*.vercel.app https://v0.dev https://v0.app https://*.vusercontent.net",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
