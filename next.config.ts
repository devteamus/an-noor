import type { NextConfig } from "next";

// ডেভে প্রোডাকশনে আলাদা CSP —
//   * dev: React Fast Refresh/HMR-এর জন্য unsafe-eval দরকার
//   * prod: unsafe-eval বাদ — XSS-এর সুযোগ কমে
const isDev = process.env.NODE_ENV !== "production";

const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://www.youtube-nocookie.com https://www.youtube.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.maateen.com;
  img-src 'self' data: https: blob:;
  font-src 'self' https://fonts.gstatic.com https://fonts.maateen.com data:;
  media-src 'self' https://quranaudio.myislam.org https://www.hadithbd.com https://pub-e0f4ae7db85a4d0db7d0f6d92401108b.r2.dev https://*.r2.dev blob:;
  frame-src 'self' https://www.youtube-nocookie.com https://www.youtube.com;
  child-src 'self' https://www.youtube-nocookie.com https://www.youtube.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'self';
  connect-src 'self' https:;
  manifest-src 'self';
  worker-src 'self' blob:;
`.replace(/\n/g, " ").trim();

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Content-Security-Policy", value: ContentSecurityPolicy },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  output: "standalone",
  // standalone আউটপুট সবসময় প্রজেক্ট রুট থেকে গণনা হবে — Docker/VPS-এ
  // nested path (monorepo/git-root auto-detect) এড়াতে explicit রুট
  outputFileTracingRoot: process.cwd(),
  poweredByHeader: false,
  reactStrictMode: true,
  // টাইপ এরর সাইলেন্টলি ইগনোর করা হয় না — production build এ সরাসরি ধরা পড়ে।
  // (src/ এখন ১০০% type-clean, tsc --noEmit = 0 error)
  typescript: {
    ignoreBuildErrors: false,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        // API রেসপন্স কখনোই ইনডেক্স হবে না — Search Console এরর এড়াতে
        source: "/api/(.*)",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
    ];
  },
};

export default nextConfig;
