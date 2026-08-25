import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "http";
import { existsSync, readFileSync, statSync } from "fs";
import { extname, join, normalize } from "path";
import { chromium } from "playwright";

// Mobile layout guarantees.
//
// The failure this catches is horizontal scrolling on a phone: when one element
// is wider than the screen the whole page shifts sideways, so the right edge of
// every section is cut off. It is invisible on a desktop browser and easy to
// reintroduce with a single fixed width.
//
// The pages are served the way GitHub Pages serves them, where /blog resolves
// to blog.html. A plain static server returns a directory listing for that path
// instead, which is not a page the site ever ships.

const OUT = join(process.cwd(), "out");

const VIEWPORTS = [
  // The narrowest phone still in common use, and the width Chrome's device
  // toolbar defaults to for "Galaxy Fold".
  { name: "narrow phone", width: 320, height: 653 },
  { name: "iPhone SE", width: 375, height: 667 },
  { name: "iPhone 14 Pro", width: 393, height: 852 },
  { name: "Pixel 7", width: 412, height: 915 },
  { name: "tablet", width: 768, height: 1024 },
];

const ROUTES = ["/", "/blog", "/ai-agents", "/gender-equality-plan"];

const MIME = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".txt": "text/plain",
  ".xml": "application/xml",
  ".woff2": "font/woff2",
};

let server;
let browser;
let origin;

before(async () => {
  assert.ok(existsSync(OUT), "out/ is missing. Run `npm run build` before the tests.");

  server = createServer((request, response) => {
    const path = normalize(decodeURIComponent(request.url.split("?")[0])).replace(/^(\.\.[/\\])+/, "");
    let file = join(OUT, path);

    if (existsSync(file) && statSync(file).isDirectory()) {
      const index = join(file, "index.html");
      file = existsSync(index) ? index : `${file.replace(/[/\\]$/, "")}.html`;
    } else if (!existsSync(file) && existsSync(`${file}.html`)) {
      file = `${file}.html`;
    }

    if (!existsSync(file) || statSync(file).isDirectory()) {
      response.writeHead(404).end("not found");
      return;
    }
    response.writeHead(200, { "content-type": MIME[extname(file)] ?? "application/octet-stream" });
    response.end(readFileSync(file));
  });

  await new Promise((resolve) => server.listen(0, resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch();
});

after(async () => {
  await browser?.close();
  server?.close();
});

/** Measures overflow past the right edge, as a phone would experience it. */
const inspect = async (route, viewport) => {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  try {
    const page = await context.newPage();
    await page.goto(`${origin}${route}`, { waitUntil: "networkidle" });
    return await page.evaluate(() => {
      const root = document.documentElement;
      const offenders = [];
      for (const element of document.querySelectorAll("body *")) {
        const style = getComputedStyle(element);
        if (style.display === "none" || style.visibility === "hidden") continue;
        const box = element.getBoundingClientRect();
        if (box.width === 0 || box.height === 0) continue;
        // One pixel of tolerance for sub-pixel rounding.
        if (box.right > root.clientWidth + 1) {
          const name = (element.className || "").toString().trim().split(/\s+/)[0];
          offenders.push(
            `${element.tagName.toLowerCase()}${name ? `.${name}` : ""}@${Math.round(box.right)}px`,
          );
        }
      }
      const faqItems = [...document.querySelectorAll("#faq .faq-item")];
      return {
        overflow: root.scrollWidth - root.clientWidth,
        clientWidth: root.clientWidth,
        offenders: [...new Set(offenders)].slice(0, 6),
        faq: {
          present: Boolean(document.querySelector("#faq")),
          count: faqItems.length,
          lefts: [...new Set(faqItems.map((item) => Math.round(item.getBoundingClientRect().left)))],
          widest: Math.max(0, ...faqItems.map((item) => Math.round(item.getBoundingClientRect().width))),
          clipped: faqItems.filter((item) => item.scrollWidth > item.clientWidth + 1).length,
        },
      };
    });
  } finally {
    await context.close();
  }
};

for (const viewport of VIEWPORTS) {
  test(`no page scrolls sideways at ${viewport.width}px (${viewport.name})`, async () => {
    for (const route of ROUTES) {
      const result = await inspect(route, viewport);
      assert.equal(
        result.clientWidth,
        viewport.width,
        `${route} did not lay out at the requested width, so this measurement is meaningless`,
      );
      assert.deepEqual(
        result.offenders,
        [],
        `${route} at ${viewport.width}px has content past the right edge: ${result.offenders.join(", ")}`,
      );
      assert.ok(
        result.overflow <= 0,
        `${route} at ${viewport.width}px scrolls sideways by ${result.overflow}px`,
      );
    }
  });
}

test("the home FAQ stacks into one readable column on every phone", async () => {
  for (const viewport of VIEWPORTS) {
    const { faq } = await inspect("/", viewport);
    assert.ok(faq.present, `the FAQ section is missing at ${viewport.width}px`);
    assert.equal(faq.count, 6, `expected 6 FAQ cards at ${viewport.width}px, saw ${faq.count}`);
    assert.equal(
      faq.lefts.length,
      1,
      `FAQ cards are not in a single column at ${viewport.width}px`,
    );
    assert.ok(
      faq.widest <= viewport.width,
      `an FAQ card is ${faq.widest}px wide at ${viewport.width}px`,
    );
    assert.equal(faq.clipped, 0, `${faq.clipped} FAQ cards clip their text at ${viewport.width}px`);
  }
});
