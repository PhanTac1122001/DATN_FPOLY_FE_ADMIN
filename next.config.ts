import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "standalone",
    reactStrictMode: true,
    poweredByHeader: false,
    typedRoutes: true,
    experimental: {},
    transpilePackages: ["tiptap-markdown"],
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "img.youtube.com",
            },
            {
                protocol: "https",
                hostname: "www.figma.com",
                pathname: "/api/**",
            },
            {
                protocol: "http",
                hostname: "res.cloudinary.com",
            },
            {
                protocol: "https",
                hostname: "res.cloudinary.com",
            },
            {
                protocol: "https",
                hostname: "placehold.co",
            },
            {
                protocol: "http",
                hostname: "localhost",
                port: "3845",
            },
            {
                protocol: "http",
                hostname: "localhost",
                port: "5000",
            },
            {
                protocol: "http",
                hostname: "103.118.29.137",
                port: "65432",
            },
            {
                protocol: "https",
                hostname: "phenika-storage.s3.ap-southeast-2.amazonaws.com",
            },
            {
                protocol: "https",
                hostname: "rikkeiedu-storage.s3.ap-southeast-2.amazonaws.com",
            },
        ],
    },
    async rewrites() {
        return [
            {
                source: "/api/:path*",
                destination: `${process.env.API_URL || "http://backend:3000"}/api/:path*`,
            },
            {
                source: "/v1/:path*",
                destination: `${process.env.API_URL || "http://backend:3000"}/v1/:path*`,
            },
        ];
    },
};

const isSentryDisabled = process.env.NEXT_DISABLE_SENTRY === "true";

const finalConfig = isSentryDisabled
    ? nextConfig
    : withSentryConfig(nextConfig, {
          // For all available options, see:
          // https://www.npmjs.com/package/@sentry/webpack-plugin#options

          org: process.env.SENTRY_ORG || "vfund-future",

          project: process.env.SENTRY_PROJECT || "javascript-nextjs",

          // Only print logs for uploading source maps in CI
          silent: !process.env.CI,

          // For all available options, see:
          // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

          // Upload a larger set of source maps for prettier stack traces (increases build time)
          widenClientFileUpload: true,

          // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
          // This can increase your server load as well as your hosting bill.
          // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
          // side errors will fail.
          tunnelRoute: "/monitoring",

          webpack: {
              // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
              // See the following for more information:
              // https://docs.sentry.io/product/crons/
              // https://vercel.com/docs/cron-jobs
              automaticVercelMonitors: true,

              // Tree-shaking options for reducing bundle size
              treeshake: {
                  // Automatically tree-shake Sentry logger statements to reduce bundle size
                  removeDebugLogging: true,
              },
          },
      });

export default finalConfig;
