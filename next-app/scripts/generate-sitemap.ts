import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { blogPosts } from "../app/blog/posts";

type SitemapEntry = {
  path: string;
  lastmod: string;
  changefreq: string;
  priority: string;
};

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

    // Date-only lastmod keeps the sitemap stable across rebuilds on the same day,
    // so crawlers are not told every page changed on every deploy.
    const today = new Date().toISOString().slice(0, 10);

    // List of pages to include in the sitemap. Blog posts are derived from the
    // registry so a new post cannot be forgotten here.
    const pages: SitemapEntry[] = [
      { path: "/", lastmod: today, changefreq: "weekly", priority: "1.0" },
      { path: "/ai-agents", lastmod: today, changefreq: "weekly", priority: "0.9" },
      { path: "/blog", lastmod: today, changefreq: "weekly", priority: "0.8" },
      // Blog posts use their real publish date so freshness signals are accurate.
      ...blogPosts.map((post) => ({
        path: `/blog/${post.slug}`,
        lastmod: post.date,
        changefreq: "monthly",
        priority: "0.7",
      })),
      { path: "/gender-equality-plan", lastmod: today, changefreq: "yearly", priority: "0.4" },
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${
      pages
        .map(({ path, lastmod, changefreq, priority }) =>
          `  <url>
    <loc>${baseUrl}${path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
        )
        .join("\n")
    }
</urlset>
`;

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
