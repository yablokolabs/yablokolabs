import { execFileSync } from "child_process";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { blogPosts } from "../app/blog/posts";

type Route = {
  path: string;
  changefreq: string;
  priority: string;
  /** Sources whose last change is what "modified" means for this route. */
  sources: string[];
  /** Set for content with an authored date that outranks file history. */
  publishedOn?: string;
};

const baseUrl = "https://yablokolabs.com";

// Everything a page renders through. Shared chrome counts because a change to
// the header or footer really does change every page that renders it.
const SHARED = ["app/layout.tsx", "app/components", "app/globals.css"];

const ROUTES: Route[] = [
  { path: "/", changefreq: "weekly", priority: "1.0", sources: ["app/page.tsx", ...SHARED] },
  {
    path: "/ai-agents",
    changefreq: "weekly",
    priority: "0.9",
    sources: ["app/ai-agents", ...SHARED],
  },
  {
    path: "/blog",
    changefreq: "weekly",
    priority: "0.8",
    sources: ["app/blog/page.tsx", "app/blog/posts.ts", ...SHARED],
  },
  // Posts carry an authored publish date, which stays truthful even if the
  // file itself has never been touched since.
  ...blogPosts.map((post) => ({
    path: `/blog/${post.slug}`,
    changefreq: "monthly",
    priority: "0.7",
    sources: [`app/blog/articles/${post.slug}.tsx`, "app/blog/[slug]", ...SHARED],
    publishedOn: post.date,
  })),
  {
    path: "/gender-equality-plan",
    changefreq: "yearly",
    priority: "0.4",
    sources: ["app/gender-equality-plan", ...SHARED],
  },
];

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * True when the repository has real history to read.
 *
 * A shallow clone still answers `git log -1 -- <path>`, but every path resolves
 * to the single commit it has. That silently collapses every lastmod to the
 * build date, which is exactly the false freshness signal this generator
 * exists to avoid, so it has to be detected rather than assumed.
 */
const hasUsableHistory = (): boolean => {
  try {
    const shallow = execFileSync("git", ["rev-parse", "--is-shallow-repository"], {
      cwd: process.cwd(),
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    return shallow === "false";
  } catch {
    return false;
  }
};

/**
 * Date of the most recent commit touching any of these paths.
 *
 * lastmod has to describe the content, not the build. Deriving it from the
 * clock re-stamps every page on every deploy, which trains crawlers to ignore
 * the signal exactly when a page genuinely does change.
 */
const lastCommitDate = (paths: string[]): string | null => {
  const dates = paths
    .map((path) => {
      try {
        return execFileSync("git", ["log", "-1", "--format=%cs", "--", path], {
          cwd: process.cwd(),
          encoding: "utf8",
          stdio: ["ignore", "pipe", "ignore"],
        }).trim();
      } catch {
        return "";
      }
    })
    .filter((date) => ISO_DATE.test(date));

  return dates.length > 0 ? dates.sort().at(-1)! : null;
};

const generateSitemap = () => {
  try {
    const publicDir = join(process.cwd(), "public");
    const sitemapPath = join(publicDir, "sitemap.xml");

    if (!existsSync(publicDir)) {
      mkdirSync(publicDir, { recursive: true });
    }

    // Overridable so the tests can prove the output does not depend on the
    // clock. A history-derived lastmod must be identical whatever today is.
    const today = process.env.SITEMAP_FAKE_TODAY ?? new Date().toISOString().slice(0, 10);
    const usableHistory = hasUsableHistory();
    const withoutHistory: string[] = [];

    const entries = ROUTES.map((route) => {
      const committed = usableHistory ? lastCommitDate(route.sources) : null;
      if (!committed) withoutHistory.push(route.path);

      // Take the most recent honest signal. A post edited after publication
      // should report the edit rather than the original publish date.
      const candidates = [committed, route.publishedOn].filter((date): date is string => Boolean(date));
      const lastmod = candidates.length > 0 ? candidates.sort().at(-1)! : today;

      return { ...route, lastmod };
    });

    if (withoutHistory.length > 0) {
      // Without real history the dates quietly collapse to the build date, so
      // every page would claim to have changed on every deploy. Say so rather
      // than shipping an inflated signal.
      console.warn(
        `warning: no usable git history for ${withoutHistory.join(", ")}. `
          + "lastmod fell back to today, which overstates freshness. "
          + "Give the checkout full history (actions/checkout fetch-depth: 0).",
      );
    }

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${
      entries
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

    writeFileSync(sitemapPath, sitemap);
    console.log(`Sitemap generated successfully at: ${sitemapPath}`);
    return true;
  } catch (error) {
    console.error("Error generating sitemap:", error);
    process.exit(1);
  }
};

if (require.main === module) {
  generateSitemap();
}

export default generateSitemap;
