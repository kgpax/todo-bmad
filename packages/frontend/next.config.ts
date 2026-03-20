import path from "path";
import type { NextConfig } from "next";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

if (!process.env.NEXT_PUBLIC_API_URL && process.env.NODE_ENV === "production") {
  console.warn(
    "[next.config.ts] NEXT_PUBLIC_API_URL is not set — CSP connect-src defaults to http://localhost:3001. " +
      "Set this env var at build time for production deployments."
  );
}

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname, "../../"),
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
              "font-src 'self' fonts.gstatic.com",
              "img-src 'self' data:",
              `connect-src 'self' ${apiUrl}`,
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
