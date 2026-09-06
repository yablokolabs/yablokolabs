import { afterEach, test } from "node:test";
import assert from "node:assert/strict";

// Dynamic import keeps the tsx loader race (multi-file `node --test` spawns
// each file as a child process) from tripping over the static import of a .ts
// module. The payload contract is guarded the same either way.
const { buildAiAgentLeadFormData, FORMSPREE_ENDPOINT, submitFormspree } = await import(
  "../app/components/formspree.ts"
);

// Guards the exact payload contract the AI Agent Assistant (and the /ai-agents
// lead form) send to Formspree. The real endpoint is not hit — fetch is
// stubbed — but this catches regressions in the endpoint, headers, field
// names, subject, and reply-to before anything ships.

const LEAD = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  company: "Analytical Engines",
  agentType: "DevOps & automation",
  challenge: "Automate our deployment pipeline.",
};

afterEach(() => {
  delete globalThis.fetch;
});

test("buildAiAgentLeadFormData appends every expected field", () => {
  const formData = buildAiAgentLeadFormData(LEAD);
  assert.equal(formData.get("name"), LEAD.name);
  assert.equal(formData.get("email"), LEAD.email);
  assert.equal(formData.get("company"), LEAD.company);
  assert.equal(formData.get("agent_type"), LEAD.agentType);
  assert.equal(formData.get("challenge"), LEAD.challenge);
  assert.equal(formData.get("_replyto"), LEAD.email);
  assert.equal(formData.get("_subject"), `AI Agent Assistant Lead - ${LEAD.company}`);
});

test("buildAiAgentLeadFormData falls back to the name in the subject without a company", () => {
  const formData = buildAiAgentLeadFormData({ ...LEAD, company: "" });
  assert.equal(formData.get("_subject"), `AI Agent Assistant Lead - ${LEAD.name}`);
});

test("submitFormspree POSTs JSON-accepting form data to the endpoint", async () => {
  let captured;
  globalThis.fetch = async (url, options) => {
    captured = { url, options };
    return { ok: true };
  };

  const formData = buildAiAgentLeadFormData(LEAD);
  await submitFormspree(formData);

  assert.equal(captured.url, FORMSPREE_ENDPOINT);
  assert.equal(captured.options.method, "POST");
  assert.deepEqual(captured.options.headers, { Accept: "application/json" });
  assert.equal(captured.options.body, formData);
});

test("submitFormspree rejects when Formspree returns an error status", async () => {
  globalThis.fetch = async () => ({ ok: false, status: 500 });

  await assert.rejects(
    () => submitFormspree(buildAiAgentLeadFormData(LEAD)),
    /failed with status 500/,
  );
});

test("submitFormspree rejects when the network request fails", async () => {
  globalThis.fetch = async () => {
    throw new Error("network down");
  };

  await assert.rejects(
    () => submitFormspree(buildAiAgentLeadFormData(LEAD)),
    /network down/,
  );
});