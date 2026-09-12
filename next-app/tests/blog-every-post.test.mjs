import { test, before } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

// Every slug the blog index links must serve its own article body — not the
// site's 404 shell. generateStaticParams emits a file per registry slug even
// when no article component is registered (Next renders notFound for it), so
// the "is actually exported" check alone cannot catch a forgotten article.
const OUT = join(process.cwd(), "out");

const resolveExport = (route) => {
  const candidates = [join(OUT, `${route}.html`), join(OUT, route, "index.html")];
  return candidates.find((candidate) => existsSync(candidate));
};

let cards = [];

const decodeEntities = (text) =>
  text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'");

before(() => {
  const indexPath = resolveExport("blog");
  if (!indexPath) {
    throw new Error(
      'No exported page for the blog index at out/blog.html or out/blog/index.html. Run "npm run build" before "npm test".',
    );
  }
  const blogHtml = readFileSync(indexPath, "utf8");
  const pattern = /<h2 class="blog-card-title">\s*<a href="\/blog\/([a-z0-9-]+)">([\s\S]*?)<\/a>/g;
  cards = [...blogHtml.matchAll(pattern)].map((match) => ({ slug: match[1], title: match[2].trim() }));
  assert.ok(cards.length > 0, "The blog index links no posts at all.");
});

test("every indexed post serves its own article title as rendered HTML", () => {
  // Collect every mismatch so one broken post cannot hide another.
  const failures = [];
  for (const { slug, title } of cards) {
    const path = resolveExport(`blog/${slug}`);
    if (!path) {
      failures.push(
        `The index links /blog/${slug} but the build exported no page for it, so the link 404s.`,
      );
      continue;
    }
    const html = readFileSync(path, "utf8");
    const heading = html.match(/<h1 class="blog-article-title">([\s\S]*?)<\/h1>/);
    if (!heading) {
      failures.push(
        `/blog/${slug} renders no article h1. ` +
          `It likely serves the 404 shell because no article component is registered for the slug.`,
      );
      continue;
    }
    // The index link text and the article h1 pass through the same escaping,
    // so compare entity-decoded text rather than raw markup.
    if (decodeEntities(heading[1].trim()) !== decodeEntities(title)) {
      failures.push(
        `/blog/${slug} renders article title "${heading[1].trim()}" but the index links it as "${title}".`,
      );
    }
  }
  assert.deepEqual(failures, [], `Broken post pages:\n- ${failures.join("\n- ")}`);
});
