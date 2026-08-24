import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { blogPosts } from "../app/blog/posts";

// Sitemap generator for Yabloko Labs
const generateSitemap = () => {
  try {
    const baseUrl = "https://yablokolabs.com";
    const publicDir = join(process.cwd(), "public");
    const sitemapPath = join(publicDir, "sitemap.xml");

    // Ensure public directory exists
    if (!existsSync(publicDir)) {
      mkdirSync(publicDir, { recursive: true });
    }

    // List of pages to include in the sitemap. Blog posts are derived from the
    // registry so a new post cannot be forgotten here.
    const pages: { path: string; lastmod: string }[] = [
      { path: "/", lastmod: new Date().toISOString() }, // Home page
      { path: "/ai-agents", lastmod: new Date().toISOString() },
      { path: "/gender-equality-plan", lastmod: new Date().toISOString() },
      { path: "/blog", lastmod: new Date().toISOString() },
      // Blog posts use their real publish date so freshness signals are accurate.
      ...blogPosts.map((post) => ({ path: `/blog/${post.slug}`, lastmod: post.date })),
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${
      pages
        .map(({ path, lastmod }) => {
          return `
  <url>
    <loc>${baseUrl}${path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
        })
        .join("")
    }
</urlset>`;

    // Write the sitemap to the public directory
    writeFileSync(sitemapPath, sitemap);
    console.log(`Sitemap generated successfully at: ${sitemapPath}`);
    return true;
  } catch (error) {
    console.error("Error generating sitemap:", error);
    process.exit(1);
  }
};

// Only run this directly when executed via command line
if (require.main === module) {
  generateSitemap();
}

export default generateSitemap;
