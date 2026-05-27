import type { NextConfig } from "next";

// Bundle analyzer — run with: ANALYZE=true npx next build
const withBundleAnalyzer =
  process.env.ANALYZE === "true"
    ? require("@next/bundle-analyzer")({ enabled: true })
    : (c: NextConfig) => c;

const nextConfig: NextConfig = {
  async headers() {
    return [
      // CORS for Flutter mobile/web app hitting local API routes
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin",  value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options",            value: "DENY" },
          { key: "X-Content-Type-Options",      value: "nosniff" },
          { key: "Referrer-Policy",             value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security",   value: "max-age=31536000; includeSubDomains" },
          { key: "Permissions-Policy",          value: "camera=(), microphone=(), geolocation=(), payment=(self)" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""} https://iframe.paymob.com https://accept.paymobsolutions.com`,
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data: https://fonts.gstatic.com",
              "connect-src 'self' https://accept.paymobsolutions.com",
              "frame-src https://iframe.paymob.com https://accept.paymobsolutions.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
    ];
  },

  poweredByHeader: false,
  trailingSlash:   false,

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default withBundleAnalyzer(nextConfig);
