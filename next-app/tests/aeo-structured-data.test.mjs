import { before, test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { JSDOM } from "jsdom";
import jsonld from "jsonld";

// Answer Engine Optimization guarantees.
//
// Everything below is asserted against out/ exactly as a crawler receives it,
// and parsed with real parsers rather than string matching:
//   - JSON-LD is expanded by a JSON-LD 1.1 processor, so a block only counts
//     if a standards-compliant consumer would actually resolve its terms.
//   - HTML is parsed with JSDOM and scripts are never executed, which is what
//     GPTBot, ClaudeBot and PerplexityBot do.
// String matching would happily pass on markup that no crawler can consume.

const OUT = join(process.cwd(), "out");
const SD = "http://schema.org/";

const ROUTES = [
  { file: "index.html", url: "https://yablokolabs.com", crumbDepth: 1 },
  { file: "ai-agents.html", url: "https://yablokolabs.com/ai-agents", crumbDepth: 2 },
  { file: "blog.html", url: "https://yablokolabs.com/blog", crumbDepth: 2 },
  {
    file: "gender-equality-plan.html",
    url: "https://yablokolabs.com/gender-equality-plan",
    crumbDepth: 2,
  },
  {
    file: "blog/hermes-provider-fallbacks.html",
    url: "https://yablokolabs.com/blog/hermes-provider-fallbacks",
    crumbDepth: 3,
  },
  {
    file: "blog/hermes-restate-durable-tasks.html",
    url: "https://yablokolabs.com/blog/hermes-restate-durable-tasks",
    crumbDepth: 3,
  },
  {
    file: "blog/searxng-independent-discovery.html",
    url: "https://yablokolabs.com/blog/searxng-independent-discovery",
    crumbDepth: 3,
  },
];

/** Collect every @type-bearing node from an expanded JSON-LD tree. */
const collectNodes = (node, acc = []) => {
  if (Array.isArray(node)) {
    node.forEach((entry) => collectNodes(entry, acc));
    return acc;
  }
  if (node && typeof node === "object") {
    if (node["@type"]) acc.push(node);
    for (const [key, value] of Object.entries(node)) {
      if (key !== "@type") collectNodes(value, acc);
    }
  }
  return acc;
};

const typesOf = (node) => [].concat(node["@type"] ?? []);
const nodesOfType = (nodes, type) => nodes.filter((node) => typesOf(node).includes(SD + type));

const valueOf = (node, property) => {
  if (!node) return undefined;
  const raw = node[SD + property];
  if (!raw) return undefined;
  const first = Array.isArray(raw) ? raw[0] : raw;
  return first && typeof first === "object" ? (first["@value"] ?? first["@id"]) : first;
};

const pages = new Map();

before(async () => {
  for (const route of ROUTES) {
    const path = join(OUT, route.file);
    assert.ok(
      existsSync(path),
      `${route.file} is missing from out/. Run \`npm run build\` before the tests.`,
    );

    const document = new JSDOM(readFileSync(path, "utf8")).window.document;
    const blocks = [...document.querySelectorAll('script[type="application/ld+json"]')];
    const nodes = [];

    for (const block of blocks) {
      const parsed = JSON.parse(block.textContent);
      const expanded = await jsonld.expand(parsed);
      assert.notEqual(
        expanded.length,
        0,
        `${route.file} has a JSON-LD block that expands to nothing, which means its @context did not resolve.`,
      );
      collectNodes(expanded, nodes);
    }

    pages.set(route.file, { document, nodes, route });
  }
});

test("every route exposes JSON-LD that resolves into the schema.org vocabulary", () => {
  for (const [file, { nodes }] of pages) {
    assert.ok(nodes.length > 0, `${file} exposes no structured data`);
    const unmapped = nodes
      .flatMap(typesOf)
      .filter((type) => !type.startsWith(SD));
    assert.deepEqual(
      unmapped,
      [],
      `${file} declares types that do not map into schema.org, so consumers will drop them: ${unmapped}`,
    );
  }
});

test("every route declares a self-referential canonical", () => {
  for (const [file, { document, route }] of pages) {
    const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute("href");
    assert.equal(
      canonical,
      route.url,
      `${file} points its canonical at ${canonical} instead of itself`,
    );
  }
});

test("every route has a unique title, so no page inherits another's", () => {
  const titles = [...pages].map(([file, { document }]) => [
    file,
    document.querySelector("title")?.textContent?.trim() ?? "",
  ]);

  for (const [file, title] of titles) {
    assert.ok(title.length > 0, `${file} has no title`);
  }

  const counts = new Map();
  for (const [, title] of titles) counts.set(title, (counts.get(title) ?? 0) + 1);
  const duplicated = [...counts].filter(([, count]) => count > 1).map(([title]) => title);
  assert.deepEqual(duplicated, [], `these titles are used by more than one route: ${duplicated}`);
});

test("every route carries a well-formed breadcrumb trail", () => {
  for (const [file, { nodes, route }] of pages) {
    const lists = nodesOfType(nodes, "BreadcrumbList");
    assert.equal(lists.length, 1, `${file} should expose exactly one BreadcrumbList`);

    const items = collectNodes(lists[0][`${SD}itemListElement`] ?? [])
      .filter((node) => typesOf(node).includes(`${SD}ListItem`))
      .map((node) => ({
        position: Number(valueOf(node, "position")),
        name: valueOf(node, "name"),
        item: valueOf(node, "item"),
      }))
      .sort((a, b) => a.position - b.position);

    assert.equal(items.length, route.crumbDepth, `${file} has the wrong breadcrumb depth`);
    items.forEach((item, index) => {
      assert.equal(item.position, index + 1, `${file} breadcrumb positions are not sequential`);
      assert.ok(item.name, `${file} has a breadcrumb without a name`);
    });
    assert.equal(
      items[0].item,
      "https://yablokolabs.com/",
      `${file} breadcrumb does not start at the home page`,
    );
    assert.equal(
      items.at(-1).item,
      route.file === "index.html" ? "https://yablokolabs.com/" : route.url,
      `${file} breadcrumb does not end at the page itself`,
    );
  }
});

test("home page FAQ markup is backed by text a crawler can actually see", () => {
  const { document, nodes } = pages.get("index.html");

  assert.equal(nodesOfType(nodes, "FAQPage").length, 1, "the home page should expose one FAQPage");

  const questions = nodesOfType(nodes, "Question");
  assert.ok(questions.length >= 6, "the home page should answer at least six questions");

  // Scripts are never executed here, so this asserts the copy is server
  // rendered. Marking up questions that only exist after hydration is the
  // classic way to get FAQ markup ignored or penalised.
  //
  // The JSON-LD blocks live inside <body>, so they must be removed before
  // reading the text. Otherwise the markup would satisfy its own check and the
  // assertion would be circular.
  const visible = document.body.cloneNode(true);
  visible.querySelectorAll("script, style, template, noscript").forEach((node) => node.remove());
  const bodyText = visible.textContent.replace(/\s+/g, " ");

  for (const question of questions) {
    const name = valueOf(question, "name");
    assert.ok(
      bodyText.includes(name.replace(/\s+/g, " ")),
      `"${name}" is marked up but never rendered into the page`,
    );

    const answer = question[`${SD}acceptedAnswer`];
    const accepted = Array.isArray(answer) ? answer[0] : answer;
    const text = valueOf(accepted, "text");
    assert.ok(text, `"${name}" has no acceptedAnswer text`);
    assert.ok(
      bodyText.includes(text.replace(/\s+/g, " ")),
      `the answer to "${name}" is marked up but never rendered into the page`,
    );
  }
});

test("the product portfolio is machine readable and matches the visible page", () => {
  const { document, nodes } = pages.get("index.html");
  const apps = nodesOfType(nodes, "SoftwareApplication");

  const schemaNames = apps.map((app) => valueOf(app, "name")).sort();
  assert.deepEqual(
    schemaNames,
    ["Q-AdMix", "Q-Consent", "Q-Porter", "Q-Router"],
    "the structured products drifted from the four shipped products",
  );

  for (const app of apps) {
    const name = valueOf(app, "name");
    assert.ok(valueOf(app, "url"), `${name} has no url`);
    assert.ok(valueOf(app, "description"), `${name} has no description`);
  }

  // Structured data that contradicts the page is worse than none at all.
  // Scripts are stripped so the JSON-LD cannot satisfy its own assertion.
  const visible = document.body.cloneNode(true);
  visible.querySelectorAll("script, style, template, noscript").forEach((node) => node.remove());
  const bodyText = visible.textContent;
  for (const name of schemaNames) {
    assert.ok(bodyText.includes(name), `${name} is in the markup but not on the page`);
  }
});

test("the open source MCP servers are machine readable", () => {
  const { nodes } = pages.get("index.html");
  const sources = nodesOfType(nodes, "SoftwareSourceCode");

  assert.deepEqual(
    sources.map((source) => valueOf(source, "name")).sort(),
    ["AI Consent", "CallLens", "Jnaapakam", "NexaCore", "TruthLens"],
    "the structured MCP servers drifted from the five published servers",
  );

  for (const source of sources) {
    assert.ok(valueOf(source, "url"), `${valueOf(source, "name")} has no url`);
    assert.ok(valueOf(source, "description"), `${valueOf(source, "name")} has no description`);
  }
});

test("the organisation stays identifiable after the home page graph was added", () => {
  const { document, nodes } = pages.get("index.html");
  const organisation = nodesOfType(nodes, "Organization")[0];

  assert.ok(organisation, "the home page no longer exposes an Organization");
  // These are the fields an answer engine quotes when asked who the company is.
  for (const property of ["name", "description", "email", "foundingDate", "url"]) {
    assert.ok(valueOf(organisation, property), `Organization is missing ${property}`);
  }

  const address = nodesOfType(nodes, "PostalAddress")[0];
  assert.ok(address, "the home page exposes no PostalAddress");
  for (const property of ["streetAddress", "addressLocality", "postalCode", "addressCountry"]) {
    assert.ok(valueOf(address, property), `PostalAddress is missing ${property}`);
  }

  assert.equal(
    document.querySelector('link[rel="alternate"][type="text/markdown"]')?.getAttribute("href"),
    "/llms.txt",
    "llms.txt is no longer discoverable from the HTML",
  );
});
