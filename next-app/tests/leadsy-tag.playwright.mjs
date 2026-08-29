import assert from "node:assert/strict";
import { chromium } from "playwright";

const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:3000";
const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage();
  await page.goto(baseUrl, { waitUntil: "networkidle" });

  const tag = page.locator("head script#vtag-ai-js");
  assert.equal(await tag.count(), 1, "Leadsy tracking script should be present in the document head.");
  assert.equal(await tag.getAttribute("src"), "https://r2.leadsy.ai/tag.js");
  assert.equal(await tag.getAttribute("data-pid"), "hQwoDg4gysSBJwpa");
  assert.equal(await tag.getAttribute("data-version"), "062024");
  assert.equal(await tag.getAttribute("async"), "");
} finally {
  await browser.close();
}
