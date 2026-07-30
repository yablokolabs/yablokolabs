import { test, before } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const CANDIDATE_PAGES = [
  join(process.cwd(), "out", "ai-agents.html"),
  join(process.cwd(), "out", "ai-agents", "index.html"),
];

let html = "";

before(() => {
  const builtPage = CANDIDATE_PAGES.find((candidate) => existsSync(candidate));
  if (!builtPage) {
    throw new Error(
      `Built page not found at any of:\n  ${CANDIDATE_PAGES.join("\n  ")}\n` +
        `Run "npm run build" before "npm test".`,
    );
  }
  html = readFileSync(builtPage, "utf8");
});

// Claims that would assert Yabloko Labs itself holds a certification it does not
// hold. These must never reach the shipped page.
const FORBIDDEN_CLAIMS = [
  "we are certified",
  "we are iso",
  "our iso certification",
  "our certification",
  "iso certified",
  "iso 27001 certified",
  "iso/iec 27001 certified",
  "iso/iec 42001 certified",
  "certified to iso",
  "compliant with iso",
  "iso compliant",
  "iso/iec compliant",
];

test("shipped page makes no certification claim on behalf of Yabloko Labs", () => {
  const lower = html.toLowerCase();
  for (const claim of FORBIDDEN_CLAIMS) {
    assert.ok(
      !lower.includes(claim),
      `Shipped page contains an unsupported certification claim: "${claim}"`,
    );
  }
});

test("shipped page states plainly that Yabloko Labs is not certified", () => {
  assert.match(
    html,
    /not an ISO-certified body/i,
    "The honest-positioning disclaimer is missing from the shipped page.",
  );
});

test("shipped page names every standard it promises to engineer against", () => {
  for (const standard of ["42001", "23894", "5338", "27001", "27701"]) {
    assert.ok(
      html.includes(standard),
      `Shipped page does not mention ISO/IEC ${standard}.`,
    );
  }
});

test("every mention of the unpublished TS 25570 is qualified as emerging", () => {
  const occurrences = [];
  let index = html.indexOf("TS 25570");
  while (index !== -1) {
    occurrences.push(index);
    index = html.indexOf("TS 25570", index + 1);
  }

  assert.ok(
    occurrences.length > 0,
    "Expected TS 25570 to appear as a research credential.",
  );

  for (const position of occurrences) {
    const preceding = html.slice(Math.max(0, position - 120), position);
    assert.match(
      preceding,
      /emerging/i,
      `TS 25570 is an unpublished work item and must be qualified as emerging. ` +
        `Unqualified mention at offset ${position}.`,
    );
  }
});

test("shipped page links the citable standards research", () => {
  assert.ok(
    html.includes("10.5281/zenodo.21603770"),
    "The Zenodo DOI backing the standards research is missing.",
  );
  // The page currently ships as an RSC payload rather than prerendered HTML,
  // so the link target appears as \"href\":\"...\" rather than href="...".
  // Accept either serialization.
  assert.match(
    html,
    /(href="|href\\":\\")https:\/\/doi\.org\/10\.5281\/zenodo\.21603770/,
    "The DOI is mentioned but not linked as a resolvable href.",
  );
});

// Yabloko Labs is a StandICT.eu fellow researching these standards, and self-
// identified as a newcomer to formal ICT standardisation in that application.
// Contributing to an ISO standard means submitted contributions, ballot comments
// and working group membership. Until that is true and verifiable against the
// relevant committee, the page must not imply it.
test("shipped page does not claim ISO committee membership or authorship", () => {
  const lower = html.toLowerCase();
  const unverifiedClaims = [
    "help shape them",
    "we help shape",
    "we shape these standards",
    "we write the standards",
    "we co-author the standards",
    "member of sc 42",
    "sc 42 member",
    "committee member",
  ];
  for (const claim of unverifiedClaims) {
    assert.ok(
      !lower.includes(claim),
      `Shipped page implies ISO committee participation, which is not established: "${claim}"`,
    );
  }
});

test("shipped page does not claim absolute security outcomes", () => {
  const lower = html.toLowerCase();
  for (const claim of ["harder to hack", "unhackable", "cannot be breached", "100% secure"]) {
    assert.ok(
      !lower.includes(claim),
      `Shipped page contains an absolute security claim: "${claim}"`,
    );
  }
});
