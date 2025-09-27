import type { NextConfig } from "next";
import { join } from "path";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true, // Required for static exports
  },
  // Copy the sitemap to the output directory
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.plugins.push(
        new (require("copy-webpack-plugin"))({
          patterns: [
            {
              from: "public/sitemap.xml",
              to: "../", // This will copy to the root of the out directory
            },
          ],
        }),
      );
    }
    return config;
  },
};

export default nextConfig;
