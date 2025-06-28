import type { NextConfig } from "next";
import { execSync } from 'child_process';
import { join } from 'path';

// Generate sitemap before the build starts
console.log('Generating sitemap...');
try {
  execSync('npx tsx scripts/generate-sitemap.ts', { stdio: 'inherit' });
  console.log('Sitemap generated successfully!');
} catch (error) {
  console.error('Failed to generate sitemap:', error);
  process.exit(1);
}

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true, // Required for static exports
  },
  // Copy the sitemap to the output directory
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.plugins.push(
        new (require('copy-webpack-plugin'))({
          patterns: [
            {
              from: 'public/sitemap.xml',
              to: '../', // This will copy to the root of the out directory
            },
          ],
        })
      );
    }
    return config;
  },
};

export default nextConfig;
