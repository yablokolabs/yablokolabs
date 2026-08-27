import * as restate from "@restatedev/restate-sdk";
import { discover } from "./sources.js";
import { hermesExecute } from "./hermes.js";
import { candidateIsPursuable, leadRegistry } from "./lead-registry.js";
import type { Candidate, Lead, Offering } from "./types.js";
import { domainOf } from "./types.js";

/**
 * The scheduled watcher from the blog post, pointed at real ICP sources.
 *
 * One durable cycle every N hours:
 *   discover -> score via Hermes -> registry decides dedup/quality ->
 *   Telegram digest for anything worth your attention.
 *
 * Every LLM/scoring call, HTTP fetch, and notification is a journaled
 * ctx.run step: if the box reboots mid-cycle, Restate replays the journal
 * and resumes exactly where it stopped — no duplicate digests, no lost work.
 */
export const prospectLoop = restate.workflow({
  name: "ProspectLoop",
  handlers: {
    run: async (ctx: restate.WorkflowContext): Promise<void> => {
      // Poll interval; configurable without a redeploy via state seeded by start().
      const hoursRaw = await ctx.get<number>("intervalHours");
      const intervalMs = (hoursRaw ?? 6) * 60 * 60 * 1000;

      while (true) {
        for (const icp of ["agents", "qubo"] as const) {
          // One durable unit per ICP so one failing source never kills the other.
          await ctx.run(`cycle:${icp}`, async () => {
            try {
              await runIcpCycle(ctx, icp);
            } catch (error) {
              // Non-terminal problem this cycle (source down, empty search...).
              // Log-and-continue keeps the loop alive; next cycle retries.
              console.error(`[${icp}] cycle failed, will retry next interval`, error);
            }
          });
        }

        await ctx.sleep(intervalMs);
      }
    },

    /** Start the loop for the given interval — idempotent per workflow key. */
    start: async (
      ctx: restate.WorkflowSharedContext,
      input: { intervalHours?: number },
    ): Promise<void> => {
      if (input.intervalHours) {
        // Only the exclusive run handler may write shared workflow state.
        // Park the value in an awakeable-free way: send it as a signal instead.
        await ctx.promise<number>("interval").resolve(input.intervalHours);
      }
    },

    stop: async (ctx: restate.WorkflowSharedContext): Promise<string> => {
      return "Cancel the run handler to stop; state stays for the next start.";
    },
  },
});

/** One discover -> score -> ingest -> notify pass for a single ICP. */
async function runIcpCycle(
  ctx: restate.WorkflowContext,
  icp: "agents" | "qubo",
): Promise<number> {
  // 1. Discovery (SearXNG + HN adapters, read-only and keyless).
  const candidates = await ctx.run(`discover ${icp}`, () => discover(icp));

  let surfaced = 0;
  for (const candidate of candidates.slice(0, 12)) {
    if (!candidateIsPursuable(candidate)) continue;

    // 2. Score with Hermes against the Yabloko Labs ICP. Journaled LLM call.
    const scored = await scoreCandidate(ctx, icp, candidate);
    if (!scored || scored.lead.fitScore < 65) continue;

    // 3. Ingest into the registry (dedup + persist). This call is itself a
    // journaled Restate invocation — retried until it succeeds, never duplicated.
    const ingestResult = await ctx
      .objectClient(leadRegistry, scored.lead.fingerprint)
      .ingest({ lead: scored.lead, reason: scored.reason });

    // 4. New prospects get a Telegram digest; repeats stay silent.
    if (ingestResult.isNew) {
      surfaced += 1;
      await ctx.objectClient(leadRegistry, scored.lead.fingerprint).notify();
    }
  }
  return surfaced;
}

const SYSTEM_RULES =
  "You are scoring sales leads strictly for Yabloko Labs (yablokolabs.com). " +
  "They sell: custom AI agent builds, and quantum-inspired QUBO optimization for routing, scheduling, logistics and similar problems.";

/**
 * Ask Hermes to judge ICP fit. Returns null when the candidate is junk,
 * off-scope, or Hermes answers something unparseable — all treated identically.
 */
async function scoreCandidate(
  ctx: restate.WorkflowContext,
  icp: "agents" | "qubo",
  candidate: Candidate,
): Promise<{ lead: Lead; reason?: string } | null> {
  const offeringWanted: Offering = icp === "qubo" ? "qubo" : "agents";
  const raw = await ctx
    .run(`hermes: score ${candidate.url}`, () =>
      hermesExecute(
        [
          SYSTEM_RULES,
          `Source page title: "${candidate.title}"`,
          `URL: ${candidate.url}`,
          `Excerpt: ${candidate.snippet.slice(0, 500)}`,
          "",
          "Answer with EXACTLY one JSON object and nothing else:",
          '{"company": string, "fitScore": number 0-100, "offering": "agents"|"qubo"|"both", "summary": string, "reason": string}',
          `"reason" is one sentence on why now is a good time to contact them.`,
          `If this page does not represent a real organisation with plausible need, set fitScore to 0.`,
        ].join("\n"),
      ),
    )
    .catch(() => null);

  if (!raw) return null;

  // Pull the first balanced JSON object out of the reply (models like prose).
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(match[0]);
  } catch {
    return null;
  }

  const p = parsed as Partial<Lead> & { reason?: string };
  if (
    typeof p.company !== "string" ||
    typeof p.fitScore !== "number" ||
    Number.isNaN(p.fitScore)
  ) {
    return null;
  }

  const offering: Offering =
    p.offering === "agents" || p.offering === "qubo" || p.offering === "both"
      ? p.offering
      : offeringWanted;

  return {
    lead: {
      fingerprint: domainOf(candidate.url) ?? crypto.randomUUID(),
      company: p.company,
      url: candidate.url,
      offering,
      fitScore: Math.max(0, Math.min(100, Math.round(p.fitScore))),
      summary: typeof p.summary === "string" ? p.summary : candidate.title,
    },
    reason: typeof p.reason === "string" ? p.reason : undefined,
  };
}
