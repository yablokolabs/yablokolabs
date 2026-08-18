import { test, before } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

// A statically exported marketing site must ship crawlable markup, not an empty
// shell that only paints once JavaScript has run. These tests read the exported
// files exactly as a crawler would receive them.
const PAGES = {
  home: join(process.cwd(), "out", "index.html"),
  aiAgents: join(process.cwd(), "out", "ai-agents.html"),
};

const html = {};

before(() => {
  for (const [name, path] of Object.entries(PAGES)) {
    if (!existsSync(path)) {
      throw new Error(`Built page not found at ${path}. Run "npm run build" before "npm test".`);
    }
    html[name] = readFileSync(path, "utf8");
  }
});

test("exported pages ship rendered markup, not an empty shell", () => {
  for (const [name, contents] of Object.entries(html)) {
    const sectionCount = (contents.match(/<section/g) ?? []).length;
    assert.ok(
      sectionCount > 0,
      `${name} contains no <section> elements in its exported HTML, ` +
        `which means the page body is not server-rendered and crawlers receive an empty shell.`,
    );
  }
});

test("the AI Agents page ships its headline copy as crawlable text", () => {
  assert.match(
    html.aiAgents,
    /<h1[^>]*>[^<]*Custom AI Agents/,
    "The h1 is not present as rendered HTML in the exported page.",
  );
});

test("structured data reaches the exported HTML as a real script tag", () => {
  const scripts = html.aiAgents.match(/<script type="application\/ld\+json">/g) ?? [];
  assert.ok(
    scripts.length >= 2,
    `Expected the Service and research JSON-LD blocks as script tags in the exported HTML, found ${scripts.length}. ` +
      `Structured data that only exists in the client payload is unreliable for search engines.`,
  );
  assert.ok(
    html.aiAgents.includes("SoftwareSourceCode"),
    "The standards research JSON-LD is missing from the exported HTML.",
  );
});

// The AI Agents tier prices live in two places: the visible pricing cards and
// the Service JSON-LD that search engines read. Nine literals, only three of
// them visible, so a price change can silently leave the structured data
// advertising the old number.
test("advertised tier prices agree with the prices in structured data", () => {
  const blocks = [...html.aiAgents.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map((match) => JSON.parse(match[1]));
  const service = blocks.find((block) => block["@type"] === "Service");

  assert.ok(service?.offers?.length, "No Service JSON-LD with offers found in the exported HTML.");

  const visibleCopy = html.aiAgents.replace(/<script[\s\S]*?<\/script>/g, "");

  for (const offer of service.offers) {
    assert.equal(
      offer.priceSpecification.price,
      offer.price,
      `${offer.name}: priceSpecification.price disagrees with offer.price.`,
    );

    const formatted = Number(offer.price).toLocaleString("en-GB");
    assert.ok(
      visibleCopy.includes(`£${formatted}/month`),
      `${offer.name}: structured data advertises £${formatted}/month, but that price ` +
        `does not appear in the page's visible pricing copy.`,
    );
  }
});
