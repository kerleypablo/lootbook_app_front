import path from "node:path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.join(__dirname),
  async rewrites() {
    // Keep browser requests on the Next origin so local development does not depend on CORS.
    return [
      {
        source: "/api/lootbook/:path*",
        destination: `${process.env.LOOTBOOK_API_URL ?? "http://localhost:3333"}/:path*`,
      },
    ];
  },
  webpack(config: import('webpack').Configuration) {
    config.module?.rules?.push({
      test: /\.svg$/,
      issuer: /\.[jt]sx?$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};

export default nextConfig;
