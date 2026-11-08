import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

/**
 * CSP estática: o Next injeta scripts/estilos inline (bootstrap, next/font), e
 * sem nonce eles exigem 'unsafe-inline'. `unsafe-eval` fica restrito ao dev,
 * onde o React Refresh precisa dele.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  isProduction
    ? "script-src 'self' 'unsafe-inline'"
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  isProduction ? "connect-src 'self'" : "connect-src 'self' ws: wss:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  ...(isProduction
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  // `jose` é publicado apenas como ESM. Transpilá-lo permite que o Jest
  // (via next/jest + SWC) o transforme para CommonJS durante os testes.
  transpilePackages: ["jose"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
