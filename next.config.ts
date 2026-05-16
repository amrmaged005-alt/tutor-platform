import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent clickjacking
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // Stop MIME-type sniffing
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Referrer policy — don't leak full URL cross-origin
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Force HTTPS in production. Avoid preload until every subdomain is
          // confirmed HTTPS-only because browser preload lists are hard to undo.
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          // Disable browser features you don't need
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(self)",
          },
          // Content Security Policy
          // Paymob iframe + Google Fonts; no Stripe references (app uses Paymob).
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Next.js requires unsafe-inline for hydration; unsafe-eval only in dev
              `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""} https://iframe.paymob.com https://accept.paymobsolutions.com`,
              // Google Fonts injects <style> at runtime; unsafe-inline is required
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https:",
              // fonts.gstatic.com serves the actual font files
              "font-src 'self' data: https://fonts.gstatic.com",
              "connect-src 'self' https://accept.paymobsolutions.com",
              // Paymob payment pages load inside an iframe
              "frame-src https://iframe.paymob.com https://accept.paymobsolutions.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
          // Opt out of Google's FLoC / Topics API
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
        ],
      },
    ];
  },

  // Recommended: strip powered-by header
  poweredByHeader: false,

  // Recommended: enforce trailing slash consistency
  trailingSlash: false,
};

export default nextConfig;
