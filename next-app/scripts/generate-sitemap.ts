import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// Sitemap generator for Yabloko Labs
const generateSitemap = () => {
  try {
    const baseUrl = 'https://yablokolabs.com';
    const publicDir = join(process.cwd(), 'public');
    const sitemapPath = join(publicDir, 'sitemap.xml');
    
    // Ensure public directory exists
    if (!existsSync(publicDir)) {
      mkdirSync(publicDir, { recursive: true });
    }
    
    // List of pages to include in the sitemap
    const pages = [
      '/',  // Home page
      // Add any other internal pages here as they are created
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${pages
    .map((page) => {
      return `
  <url>
    <loc>${baseUrl}${page}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    })
    .join('')}
</urlset>`;

    // Write the sitemap to the public directory
    writeFileSync(sitemapPath, sitemap);
    console.log(`Sitemap generated successfully at: ${sitemapPath}`);
    return true;
  } catch (error) {
    console.error('Error generating sitemap:', error);
    process.exit(1);
  }
};

// Only run this directly when executed via command line
if (require.main === module) {
  generateSitemap();
}

export default generateSitemap;
