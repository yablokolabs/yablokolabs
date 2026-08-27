import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { JSDOM } from "jsdom";

// Crawl-control artifacts, asserted against out/ as a crawler receives them.
// robots.txt and sitemap.xml are parsed rather than string matched, because a
// file that reads correctly can still parse to something a crawler rejects.

const OUT = join(process.cwd(), "out");
const BASE = "https://yablokolabs.com";
const SITEMAP_NS = "http://www.sitemaps.org/schemas/sitemap/0.9";

const read = (relative) => {
  const path = join(OUT, relative);
  assert.ok(existsSync(path), `${relative} is missing from out/. Run \`npm run build\` first.`);
  return readFileSync(path, "utf8");
};

/**
 * Minimal robots.txt evaluator following the Robots Exclusion Protocol group
 * matching rules: the most specific matching user-agent group wins, and within
 * a group the longest matching path rule wins, with Allow winning ties.
 */
const parseRobots = (text) => {
  const groups = [];
  let current = null;
  const sitemaps = [];

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, "").trim();
    if (!line) continue;
    const separator = line.indexOf(":");
    if (separator === -1) continue;
    const field = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();

    if (field === "user-agent") {
      if (!current || current.rules.length > 0) {
        current = { agents: [], rules: [] };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
    } else if (field === "allow" || field === "disallow") {
      if (current) current.rules.push({ allow: field === "allow", path: value });
    } else if (field === "sitemap") {
      sitemaps.push(value);
    }
  }

  const groupFor = (agent) => {
    const needle = agent.toLowerCase();
    const specific = groups.filter((group) =>
      group.agents.some((candidate) => candidate !== "*" && needle.startsWith(candidate))
    );
    if (specific.length > 0) return specific[0];
    return groups.find((group) => group.agents.includes("*")) ?? null;
  };

  return {
    sitemaps,
    namedAgents: new Set(groups.flatMap((group) => group.agents)),
    canFetch(agent, path) {
      const group = groupFor(agent);
      if (!group) return true;
      let best = null;
      for (const rule of group.rules) {
        if (rule.path === "" || !path.startsWith(rule.path)) continue;
        if (!best || rule.path.length > best.path.length || (rule.path.length === best.path.length && rule.allow)) {
          best = rule;
        }
      }
      return best ? best.allow : true;
    },
  };
};

// The engines whose answers we care about being cited in.
const AI_AGENTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot",
  "Applebot-Extended",
  "Bingbot",
  "CCBot",
  "Meta-ExternalAgent",
  "Amazonbot",
  "cohere-ai",
  "YouBot",
  "DuckAssistBot",
  "MistralAI-User",
];

const CRAWLABLE_PATHS = [
  "/",
  "/ai-agents",
  "/blog",
  "/blog/hermes-provider-fallbacks",
  "/blog/hermes-restate-durable-tasks",
  "/gender-equality-plan",
  "/llms.txt",
];

test("robots.txt lets every AI answer engine reach every public route", () => {
  const robots = parseRobots(read("robots.txt"));

  const blocked = [];
  for (const agent of [...AI_AGENTS, "Googlebot", "SomeCrawlerWeHaveNeverHeardOf"]) {
    for (const path of CRAWLABLE_PATHS) {
      if (!robots.canFetch(agent, path)) blocked.push(`${agent} -> ${path}`);
    }
  }
  assert.deepEqual(blocked, [], `robots.txt blocks: ${blocked.join(", ")}`);
});

test("robots.txt names the AI answer engines explicitly", () => {
  const robots = parseRobots(read("robots.txt"));
  // A bare wildcard already allows these, but naming them removes any doubt
  // about intent for operators that look for their own token.
  const unnamed = AI_AGENTS.filter((agent) => !robots.namedAgents.has(agent.toLowerCase()));
  assert.deepEqual(unnamed, [], `these agents are not named in robots.txt: ${unnamed.join(", ")}`);
});

test("robots.txt advertises the sitemap", () => {
  const robots = parseRobots(read("robots.txt"));
  assert.deepEqual(robots.sitemaps, [`${BASE}/sitemap.xml`]);
});

const parseSitemap = () => {
  const document = new JSDOM(read("sitemap.xml"), { contentType: "text/xml" }).window.document;
  assert.equal(
    document.querySelector("parsererror"),
    null,
    "sitemap.xml is not well-formed XML",
  );
  const root = document.documentElement;
  assert.equal(root.namespaceURI, SITEMAP_NS, "sitemap.xml is not in the sitemaps.org namespace");
  assert.equal(root.localName, "urlset", "sitemap.xml root element should be <urlset>");

  return [...root.getElementsByTagNameNS(SITEMAP_NS, "url")].map((url) => {
    const text = (name) => url.getElementsByTagNameNS(SITEMAP_NS, name)[0]?.textContent ?? "";
    return {
      loc: text("loc"),
      lastmod: text("lastmod"),
      changefreq: text("changefreq"),
      priority: text("priority"),
    };
  });
};

test("sitemap.xml entries satisfy the sitemaps.org schema", () => {
  const entries = parseSitemap();
  assert.ok(entries.length > 0, "sitemap.xml lists no urls");

  const allowedFrequencies = new Set([
    "always",
    "hourly",
    "daily",
    "weekly",
    "monthly",
    "yearly",
    "never",
  ]);

  for (const entry of entries) {
    assert.ok(entry.loc.startsWith(BASE), `${entry.loc} is not an absolute site url`);
    assert.match(
      entry.lastmod,
      /^\d{4}-\d{2}-\d{2}$/,
      `${entry.loc} has lastmod "${entry.lastmod}". A build timestamp tells crawlers every page changed on every deploy, which devalues the freshness signal.`,
    );
    assert.ok(
      allowedFrequencies.has(entry.changefreq),
      `${entry.loc} has changefreq "${entry.changefreq}"`,
    );
    const priority = Number(entry.priority);
    assert.ok(priority >= 0 && priority <= 1, `${entry.loc} has priority "${entry.priority}"`);
  }

  const locations = entries.map((entry) => entry.loc);
  assert.equal(new Set(locations).size, locations.length, "sitemap.xml repeats a url");
});

test("sitemap.xml lists exactly the routes that were exported", () => {
  const listed = new Set(parseSitemap().map((entry) => entry.loc));

  // Derived from the export, so a new page cannot be silently left out and a
  // deleted page cannot keep being advertised as a soon-to-be 404.
  const exported = new Set(
    ["index", "ai-agents", "blog", "gender-equality-plan"]
      .map((route) => (route === "index" ? `${BASE}/` : `${BASE}/${route}`))
      .concat(
        ["hermes-provider-fallbacks", "hermes-restate-durable-tasks", "searxng-independent-discovery"].map(
          (slug) => `${BASE}/blog/${slug}`,
        ),
      ),
  );

  const advertisedButMissing = [...listed].filter((url) => !exported.has(url));
  const exportedButUnlisted = [...exported].filter((url) => !listed.has(url));
  assert.deepEqual(advertisedButMissing, [], "sitemap advertises routes that were not exported");
  assert.deepEqual(exportedButUnlisted, [], "exported routes are missing from the sitemap");
});

test("llms.txt describes the company and only links to things that exist", () => {
  const body = read("llms.txt");

  assert.match(body, /Yabloko Labs Ltd/, "llms.txt omits the legal name");
  assert.match(body, /support@yablokolabs\.com/, "llms.txt omits the contact address");

  const links = [...body.matchAll(/\((https:\/\/[^)]+)\)/g)].map((match) => match[1]);
  const internal = links.filter((link) => link.startsWith(BASE));
  assert.ok(internal.length > 0, "llms.txt links nowhere on the site");

  const dead = internal.filter((link) => {
    const path = link.split("#")[0].replace(BASE, "").replace(/^\//, "");
    const candidates = path === ""
      ? ["index.html"]
      : [path, `${path}.html`, join(path, "index.html")];
    return !candidates.some((candidate) => existsSync(join(OUT, candidate)));
  });
  assert.deepEqual(dead, [], `llms.txt links to files that do not exist: ${dead.join(", ")}`);

  // An anchor that points at no element sends an agent to the top of the page
  // with no idea it missed the section it was promised.
  const brokenAnchors = [];
  for (const link of internal.filter((candidate) => candidate.includes("#"))) {
    const [page, fragment] = link.split("#");
    const relative = page.replace(BASE, "").replace(/^\//, "");
    const file = relative === "" ? "index.html" : `${relative}.html`;
    if (!existsSync(join(OUT, file))) {
      brokenAnchors.push(`${link} (no such page)`);
      continue;
    }
    const document = new JSDOM(readFileSync(join(OUT, file), "utf8")).window.document;
    if (!document.getElementById(fragment)) brokenAnchors.push(`${link} (no such id)`);
  }
  assert.deepEqual(brokenAnchors, [], `llms.txt has anchors that go nowhere: ${brokenAnchors}`);
});
