// End-to-end test of the AI Agent Assistant widget, driven by Lightpanda
// (a headless browser in Zig — no Chromium download needed) through
// playwright-core's CDP connection.
//
//   npm run test:assistant
//
// Requires the app to be running (npm run dev) and @lightpanda/browser
// installed. The Formspree POST is intercepted when the browser supports it,
// so no real email is sent; otherwise the script warns and hits the real
// endpoint (which is also a valid end-to-end check).
//
// Lightpanda does not render or lay out the page like a GUI browser (fixed
// elements, in particular, land outside its viewport), so interactions are
// dispatched at the DOM level (element.click(), the native input setter +
// input event). That still exercises the real React handlers, state machine,
// timers, and the Formspree POST.
//
// The widget ignores submissions while its typing indicator is active, so
// every turn waits for the user bubble to appear (the send was accepted) and
// for typing to finish before answering the next question.

import { lightpanda } from "@lightpanda/browser";
import { chromium } from "playwright-core";
import assert from "node:assert/strict";

const BASE_URL = process.env.BASE_URL ?? "http://127.0.0.1:3000";
const LPD = { host: "127.0.0.1", port: 9222 };

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let proc;
let browser;
let formspreeBody = null;
let interception = false;

/** Click an element by dispatching a native click from inside the page. */
const click = (page, selector) => page.locator(selector).evaluate((el) => el.click());

/** Type into the assistant input using the native value setter React expects. */
const typeInto = (page, text) =>
  page.locator(".assistant-input").evaluate((el, value) => {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
    setter.call(el, value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
  }, text);

const userMsgCount = (page) => page.locator(".assistant-msg-user").count();

const waitForIdle = (page) =>
  page.waitForFunction(() => document.querySelectorAll(".assistant-typing").length === 0, { timeout: 15000 });

/** Type an answer, submit it, and wait for the turn to complete. */
async function sendAnswer(page, text) {
  const before = await userMsgCount(page);
  await typeInto(page, text);
  await click(page, ".assistant-send");
  await page.waitForFunction((n) => document.querySelectorAll(".assistant-msg-user").length > n, before, {
    timeout: 5000,
  });
  await waitForIdle(page);
}

/** True while the widget carries the .show class (the source of visibility). */
const widgetIsShown = (page) =>
  page.evaluate(() => document.querySelector(".assistant-widget")?.classList.contains("show") ?? false);

async function main() {
  console.log("🐼 Starting Lightpanda...");
  proc = await lightpanda.serve(LPD);

  browser = await chromium.connectOverCDP({ endpointURL: `ws://${LPD.host}:${LPD.port}` });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Intercept the Formspree POST so the test never sends a real email.
  try {
    await page.route("**/formspree.io/**", async (route) => {
      formspreeBody = route.request().postData() ?? "";
      await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
    });
    interception = true;
    console.log("→ Formspree requests intercepted (no real email will be sent)");
  } catch (error) {
    console.log(`→ interception unavailable (${error.message.split("\n")[0]}) — the send will hit the real Formspree endpoint`);
  }

  // 1. The widget appears on its own after the landing delay.
  await page.goto(BASE_URL, { waitUntil: "load" }).catch(() => page.goto(BASE_URL));
  await page.waitForSelector(".assistant-widget.show", { timeout: 15000 });
  console.log("✓ widget appeared after landing");

  // 2. The greeting bubble and all agent-type chips render.
  await page.waitForSelector(".assistant-msg-assistant", { timeout: 10000 });
  await page.waitForSelector(".assistant-chip", { timeout: 10000 });
  const chipCount = await page.locator(".assistant-chip").count();
  assert.equal(chipCount, 7, `expected 7 agent-type chips, saw ${chipCount}`);
  console.log("✓ greeting + 7 chips rendered (incl. Quantum-inspired)");

  // 3. Picking a chip records the choice and asks the follow-up question.
  const chipsBefore = await userMsgCount(page);
  await page.locator(".assistant-chip").filter({ hasText: "Quantum-inspired" }).evaluate((el) => el.click());
  await page.waitForFunction((n) => document.querySelectorAll(".assistant-msg-user").length > n, chipsBefore, {
    timeout: 5000,
  });
  await waitForIdle(page);
  console.log("✓ chip choice recorded, next question asked");

  // 4. Describe the use case.
  await sendAnswer(page, "Automate our deployment pipeline.");
  console.log("✓ use case submitted");

  // 5. Name.
  await sendAnswer(page, "Ada Lovelace");
  console.log("✓ name submitted");

  // 6. Email validation: a bad address is rejected, a good one advances.
  const beforeBadEmail = await userMsgCount(page);
  await typeInto(page, "not-an-email");
  await click(page, ".assistant-send");
  await page.waitForSelector(".assistant-error", { timeout: 5000 });
  const errorText = (await page.locator(".assistant-error").textContent()) ?? "";
  assert.match(errorText, /email/i, "expected an email validation message");
  assert.equal(
    await userMsgCount(page),
    beforeBadEmail,
    "a rejected email must not advance the conversation",
  );
  console.log("✓ invalid email rejected with a message, conversation did not advance");

  await sendAnswer(page, "ada@example.com");
  console.log("✓ valid email accepted");

  // 7. Company (optional).
  await sendAnswer(page, "Analytical Engines");
  console.log("✓ company submitted");

  // 8. Summary bubble + send button.
  await page.waitForSelector(".assistant-widget-send", { timeout: 10000 });
  const summary = (await page.locator(".assistant-msg-assistant").last().textContent()) ?? "";
  assert.ok(summary.includes("Ada Lovelace"), "summary should contain the visitor's name");
  assert.ok(summary.includes("Quantum-inspired"), "summary should contain the chosen agent type");
  console.log("✓ summary shown with captured details");

  // 9. Submitting the request reaches Formspree with the full payload.
  await click(page, ".assistant-widget-send");
  await page.waitForFunction(() => document.body.textContent.includes("Request sent"), { timeout: 15000 });
  console.log("✓ success confirmation shown");

  if (interception) {
    assert.ok(formspreeBody, "expected a captured Formspree POST body");
    for (const field of ["name", "email", "company", "agent_type", "challenge", "_subject", "_replyto"]) {
      assert.ok(formspreeBody.includes(`name="${field}"`), `Formspree POST missing field: ${field}`);
    }
    assert.ok(formspreeBody.includes("ada@example.com"), "Formspree POST missing the email value");
    assert.ok(formspreeBody.includes("AI Agent Assistant Lead"), "Formspree POST missing the subject");
    console.log("✓ Formspree POST captured with all expected fields");
  }

  // 10. Once the request is submitted, the widget stays closed on other pages.
  await page.goto(`${BASE_URL}/blog`, { waitUntil: "load" }).catch(() => page.goto(`${BASE_URL}/blog`));
  await sleep(2500);
  assert.equal(await widgetIsShown(page), false, "widget should not re-open after submission");
  console.log("✓ widget does not re-open on other pages after submission");

  // 11. It never appears on the /ai-agents page.
  await page.goto(`${BASE_URL}/ai-agents`, { waitUntil: "load" }).catch(() => page.goto(`${BASE_URL}/ai-agents`));
  await sleep(2500);
  assert.equal(await page.locator(".assistant-widget").count(), 0, "widget must not render on /ai-agents");
  console.log("✓ widget absent on /ai-agents");

  console.log("\n✅ All assistant flow checks passed");
}

main()
  .catch((error) => {
    console.error("\n❌ Assistant flow test failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await browser?.close().catch(() => {});
    proc?.stdout.destroy();
    proc?.stderr.destroy();
    proc?.kill();
  });