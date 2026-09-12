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
  for (const { slug, title } of cards) {
    const path = resolveExport(`blog/${slug}`);
    assert.ok(
      path,
      `The index links /blog/${slug} but the build exported no page for it, so the link 404s.`,
    );
    const html = readFileSync(path, "utf8");
    assert.ok(
      html.includes(`<h1 class="blog-article-title">${title}</h1>`),
      `/blog/${slug} does not render its article title as an h1. ` +
        `It likely serves the 404 shell because no article component is registered for the slug.`,
    );
  }
});
