import { test, before } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

// The blog is part of a statically exported site, so every guarantee below is
// asserted against the files in out/ exactly as a crawler receives them.
const OUT = join(process.cwd(), "out");

const resolveExport = (route) => {
  const candidates = [join(OUT, `${route}.html`), join(OUT, route, "index.html")];
  return candidates.find((candidate) => existsSync(candidate));
};

const HERMES_SLUG = "hermes-provider-fallbacks";
const SEARXNG_SLUG = "searxng-independent-discovery";

let indexHtml = "";
let blogHtml = "";
let postHtml = "";
let searxngHtml = "";
let sitemap = "";

before(() => {
  const required = {
    "the home page": "index",
    "the blog index": "blog",
    "the Hermes post": `blog/${HERMES_SLUG}`,
    "the SearXNG post": `blog/${SEARXNG_SLUG}`,
  };

  const resolved = {};
  for (const [label, route] of Object.entries(required)) {
    const path = resolveExport(route);
    if (!path) {
      throw new Error(
        `No exported page for ${label} at out/${route}.html or out/${route}/index.html. ` +
          `Run "npm run build" before "npm test".`,
      );
    }
    resolved[route] = readFileSync(path, "utf8");
  }

  indexHtml = resolved["index"];
  blogHtml = resolved["blog"];
  postHtml = resolved[`blog/${HERMES_SLUG}`];
  searxngHtml = resolved[`blog/${SEARXNG_SLUG}`];

  const sitemapPath = join(OUT, "sitemap.xml");
  if (!existsSync(sitemapPath)) {
    throw new Error(`Sitemap not found at ${sitemapPath}. Run "npm run build" before "npm test".`);
  }
  sitemap = readFileSync(sitemapPath, "utf8");
});

test("the blog index ships each published post as crawlable markup", () => {
  assert.match(
    blogHtml,
    /Hermes Provider Fallbacks/,
    "The post title is not present as rendered HTML in the exported blog index, " +
      "which means readers and crawlers receive an empty shell.",
  );
  assert.match(
    blogHtml,
    new RegExp(`href="/blog/${HERMES_SLUG}"`),
    "The blog index does not link the post as a real href in the exported HTML.",
  );
});

test("every post linked from the index is actually exported", () => {
  const linked = new Set(
    [...blogHtml.matchAll(/href="\/blog\/([a-z0-9-]+)"/g)].map((match) => match[1]),
  );

  assert.ok(linked.size > 0, "The blog index links no posts at all.");

  for (const slug of linked) {
    assert.ok(
      resolveExport(`blog/${slug}`),
      `The index links /blog/${slug} but the build exported no page for it, so the link 404s. ` +
        `Check that generateStaticParams covers every post in the registry.`,
    );
  }
});

test("the article ships its headline and technical substance as rendered HTML", () => {
  assert.match(
    postHtml,
    /<h1[^>]*>[^<]*Hermes Provider Fallbacks/,
    "The article h1 is not present as rendered HTML in the exported page.",
  );
  assert.match(
    postHtml,
    /hermes fallback add/,
    "The article body is missing from the exported HTML, so the page only paints after hydration.",
  );
});

test("the article ships BlogPosting structured data as a real script tag", () => {
  const scripts = postHtml.match(/<script type="application\/ld\+json">/g) ?? [];
  assert.ok(
    scripts.length >= 1,
    `Expected a JSON-LD script tag in the exported article, found ${scripts.length}. ` +
      `Structured data that only exists in the client payload is unreliable for search engines.`,
  );
  assert.ok(
    postHtml.includes("BlogPosting"),
    "The article does not describe itself as a BlogPosting in its structured data.",
  );
});

test("the SearXNG post renders one headline and its full body as real HTML", () => {
  const h1Count = (searxngHtml.match(/<h1/g) ?? []).length;
  assert.equal(
    h1Count,
    1,
    `Expected exactly one h1 (the page header) in the SearXNG post, found ${h1Count}. ` +
      "The article must not render a duplicate heading of its own.",
  );
  assert.match(
    searxngHtml,
    /Aggregated Candidate Results/,
    "The architecture diagram is missing from the rendered SearXNG post.",
  );
  assert.match(
    searxngHtml,
    /discovery layer, not a truth layer/,
    "The SearXNG article body is missing from the rendered HTML.",
  );
  assert.match(
    searxngHtml,
    /class="blog-lead"[^>]*><strong>Giving an AI agent web access/,
    "The SearXNG post does not ship its opening statement as a distinct lead paragraph.",
  );
  assert.match(
    searxngHtml,
    /format=json.*403|403 Forbidden/,
    "The SearXNG article's verified JSON-format pitfall is missing from the rendered HTML.",
  );
});

test("the sitemap lists the blog index and every post", () => {
  assert.ok(
    sitemap.includes("<loc>https://yablokolabs.com/blog</loc>"),
    "The sitemap does not list the blog index.",
  );
  assert.ok(
    sitemap.includes(`<loc>https://yablokolabs.com/blog/${HERMES_SLUG}</loc>`),
    `The sitemap does not list /blog/${HERMES_SLUG}. ` +
      `The sitemap should be generated from the post registry so new posts cannot be forgotten.`,
  );
  assert.ok(
    sitemap.includes(`<loc>https://yablokolabs.com/blog/${SEARXNG_SLUG}</loc>`),
    `The sitemap does not list /blog/${SEARXNG_SLUG}. ` +
      `The sitemap should be generated from the post registry so new posts cannot be forgotten.`,
  );
});

// The source guide deliberately omits private base URLs and credentials. A
// published config example must never carry a reachable internal endpoint.
test("published config examples point only at reserved example hosts", () => {
  const values = [...postHtml.matchAll(/base_url:\s*([^\s<"']+)/g)].map((match) => match[1]);

  assert.ok(values.length > 0, "Expected the article to show a custom-endpoint base_url example.");

  for (const value of values) {
    const host = new URL(value).hostname;
    const isReserved = host === "localhost"
      || host === "127.0.0.1"
      || host === "example.com"
      || host.endsWith(".example.com");

    assert.ok(
      isReserved,
      `Config example publishes a non-reserved host: "${host}". ` +
        `Public examples must use example.com or loopback, never a real endpoint.`,
    );
  }
});

test("site navigation exposes the blog from the home page", () => {
  assert.match(
    indexHtml,
    /href="\/blog"/,
    "The home page does not link to the blog, so the blog is unreachable from the site.",
  );
});
