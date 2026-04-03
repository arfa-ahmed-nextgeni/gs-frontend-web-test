import type { NextConfig } from "next";

import createNextIntlPlugin from "next-intl/plugin";

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
    browserDebugInfoInTerminal: true,
    inlineCss: true,
    mcpServer: true,
    staleTimes: {
      dynamic: 300,
      static: 1800,
    },
  },
  async headers() {
    return [
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
      {
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=300, stale-while-revalidate=600",
          },
        ],
        source: "/category/:path*",
      },
      {
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=300, stale-while-revalidate=600",
          },
        ],
        source: "/api/categories/:path*",
      },
    ];
  },
  images: {
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 300,
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
