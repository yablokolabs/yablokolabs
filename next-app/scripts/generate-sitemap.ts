import { writeFileSync } from 'fs';
import { join } from 'path';

// Sitemap generator for Yabloko Labs
const Sitemap = () => {
  const baseUrl = 'https://yablokolabs.com';
  
  // List of pages to include in the sitemap
  const pages = [
    '/',  // Home page
    // Add any other internal pages here as they are created
  ];
  
  // External links (these won't be included in the sitemap but are here for reference)
  const externalLinks = [
    'https://map2map.com'
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
            </url>
          `;
        })
        .join('')}
    </urlset>
  `;

  try {
    // Write the sitemap to the public directory
    writeFileSync(join(process.cwd(), 'public', 'sitemap.xml'), sitemap);
    console.log('Sitemap generated successfully!');
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }
};

// Run the sitemap generation
Sitemap();

export default Sitemap;
