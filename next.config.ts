import type { NextConfig } from "next";

import createNextIntlPlugin from "next-intl/plugin";

const NO_SEO_X_ROBOTS_TAG =
  "noindex, nofollow, noarchive, nosnippet, noimageindex";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["preexpressive-marcos-intermalar.ngrok-free.dev"],
  cacheComponents: true,
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn", "info"] }
        : false,
  },
  compress: true,
  experimental: {
    authInterrupts: true,
    globalNotFound: true,
    inlineCss: true,
    mcpServer: true,
    prefetchInlining: true,
    rootParams: true,
    staleTimes: {
      dynamic: 30,
    },
    viewTransition: true,
  },
  async headers() {
    return [
      {
        headers: [
          {
            key: "X-Robots-Tag",
            value: NO_SEO_X_ROBOTS_TAG,
          },
        ],
        source: "/:path*",
      },
      {
        headers: [
          {
            key: "Content-Type",
            value: "application/json",
          },
        ],
        source: "/.well-known/apple-app-site-association",
      },
      {
        headers: [
          {
            key: "Cache-Control",
            value:
              "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          },
          {
            key: "Expires",
            value: "0",
          },
        ],
        source: "/api/:path*",
      },
      {
        headers: [
          {
            key: "Cache-Control",
            value:
              "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          },
          {
            key: "Expires",
            value: "0",
          },
        ],
        source: "/:path*/cart",
      },
    ];
  },
  images: {
    formats: ["image/webp", "image/avif"],
    remotePatterns: [
      {
        hostname: "*",
        protocol: "http",
      },
      {
        hostname: "*",
        protocol: "https",
      },
    ],
  },
  logging: {
    fetches: {
      fullUrl: true,
      hmrRefreshes: true,
    },
  },
  output: "standalone",
  productionBrowserSourceMaps:
    process.env.PRODUCTION_BROWSER_SOURCE_MAPS === "true",
  async redirects() {
    return [
      {
        destination: "/:slug",
        permanent: true,
        source: "/:slug(.+)\\.html",
      },
    ];
  },
  serverExternalPackages: ["newrelic", "@newrelic/next"],
  trailingSlash: false,
  turbopack: {
    root: __dirname,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        category: {
          chunks: "all",
          name: "category",
          priority: 10,
          test: /[\\/]src[\\/](components[\\/]category|hooks[\\/]category|lib[\\/]actions[\\/]category)[\\/]/,
        },
      };
    }
    return config;
  },
};

const withNextIntl = createNextIntlPlugin({
  experimental: {
    createMessagesDeclaration: "./messages/en.json",
  },
});
export default withNextIntl(nextConfig);
