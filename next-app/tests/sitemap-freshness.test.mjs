import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "child_process";
import { readFileSync } from "fs";
import { join } from "path";

// The sitemap generator reads git history, so its correctness depends on how
// the repository was checked out. These tests exercise that dependency
// directly rather than trusting the deploy workflow to be configured right.

const REPO_ROOT = join(process.cwd(), "..");
const NS = "http://www.sitemaps.org/schemas/sitemap/0.9";

const lastmods = (xml) => [...xml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((m) => m[1]);

const git = (args, cwd) =>
  execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();

test("the deploy workflow checks out full history for the sitemap", () => {
  const workflow = readFileSync(
    join(REPO_ROOT, ".github/workflows/nextjs-gh-pages.yml"),
    "utf8",
  );
  // Without this the checkout is shallow, every path resolves to the single
  // commit present, and every lastmod silently becomes the build date.
  assert.match(
    workflow,
    /fetch-depth:\s*0/,
    "the deploy checkout must use fetch-depth: 0 or the sitemap dates collapse to the build date",
  );
});

test("the deploy workflow installs the browser the mobile test needs", () => {
  const workflow = readFileSync(
    join(REPO_ROOT, ".github/workflows/nextjs-gh-pages.yml"),
    "utf8",
  );
  // npm ci installs the Playwright package but not the browser binary. The
  // mobile test skips rather than fails when the browser is missing, so
  // without this step it would quietly stop guarding anything.
  assert.match(
    workflow,
    /playwright install .*chromium/,
    "CI must install Chromium or the mobile layout test silently skips",
  );
});

test("this checkout has the history the sitemap generator needs", () => {
  assert.equal(
    git(["rev-parse", "--is-shallow-repository"], REPO_ROOT),
    "false",
    "this checkout is shallow, so generated lastmod values are not trustworthy",
  );
});

test("lastmod reflects content history rather than the build date", () => {
  const sitemap = readFileSync(join(process.cwd(), "public/sitemap.xml"), "utf8");
  const dates = lastmods(sitemap);
  assert.ok(dates.length > 0, "the sitemap lists no lastmod values");

  for (const date of dates) {
    assert.match(
      date,
      /^\d{4}-\d{2}-\d{2}$/,
      `lastmod "${date}" is not a plain date. A timestamp re-stamps every page on every build.`,
    );
  }

  // Every date must correspond to a real commit rather than the clock. The
  // most recent commit in the repository is the newest a page can honestly
  // claim, so anything later means the generator fell back to today.
  const newestCommit = git(["log", "-1", "--format=%cs"], REPO_ROOT);
  for (const date of dates) {
    assert.ok(
      date <= newestCommit,
      `lastmod ${date} is newer than the latest commit (${newestCommit}), so it came from the clock`,
    );
  }
});

test("regenerating on a later date does not change the sitemap", () => {
  // The whole point of deriving lastmod from history: rebuilding tomorrow with
  // no content change must not tell crawlers that every page changed.
  //
  // A clock-reading generator is only distinguishable from a history-reading
  // one when the two disagree, and today's date often equals the newest commit
  // date. So the generator is re-run against a genuinely different clock and
  // the output must be byte-identical.
  const sitemapPath = join(process.cwd(), "public/sitemap.xml");
  const before = readFileSync(sitemapPath, "utf8");

  const run = (fakeDate) => {
    execFileSync("npx", ["tsx", "scripts/generate-sitemap.ts"], {
      cwd: process.cwd(),
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      env: { ...process.env, SITEMAP_FAKE_TODAY: fakeDate },
    });
    return readFileSync(sitemapPath, "utf8");
  };

  try {
    for (const fakeDate of ["2027-03-04", "2031-11-19"]) {
      assert.equal(
        run(fakeDate),
        before,
        `the sitemap changed when the clock read ${fakeDate}, so lastmod still tracks the build date rather than the content`,
      );
    }
  } finally {
    // Leave the file as the build produced it.
    execFileSync("npx", ["tsx", "scripts/generate-sitemap.ts"], {
      cwd: process.cwd(),
      stdio: ["ignore", "pipe", "pipe"],
    });
  }
});

test("the sitemap namespace and route coverage survive regeneration", () => {
  const sitemap = readFileSync(join(process.cwd(), "public/sitemap.xml"), "utf8");
  assert.ok(sitemap.includes(NS), "the sitemap lost the sitemaps.org namespace");
  for (const route of ["/", "/ai-agents", "/blog", "/gender-equality-plan"]) {
    assert.ok(
      sitemap.includes(`<loc>https://yablokolabs.com${route}</loc>`),
      `the sitemap no longer lists ${route}`,
    );
  }
});
