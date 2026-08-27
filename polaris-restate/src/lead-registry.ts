import * as restate from "@restatedev/restate-sdk";
import { sendLeadDigest } from "./telegram.js";
import { domainOf, isBlacklisted } from "./types.js";
import { STATUS } from "./registry.js";
import type { RegistryState, Status } from "./registry.js";

export { STATUS };
export type { Status };

/**
 * One Virtual Object instance per prospect (key = lowercased domain).
 *
 * It owns the cross-run memory that a request-scoped agent loses: dedup
 * across every discovery cycle, the lifecycle status, and the lead record
 * itself. Restate persists this K/V state per key.
 */
type ObjectContext = restate.ObjectContext<RegistryState>;

function notFound(): never {
  throw new restate.TerminalError("Unknown lead", { errorCode: 404 });
}

export const leadRegistry = restate.object({
  name: "LeadRegistry",
  handlers: {
    /**
     * Ingest one scored lead. Returns true if this lead is new or worth
     * re-notifying; false when deduplicated. The call itself is journaled by
     * the caller, so ingest happens exactly once per new prospect.
     */
    ingest: async (
      ctx: ObjectContext,
      input: { lead: RegistryState["lead"]; reason?: string },
    ): Promise<{ isNew: boolean }> => {
      const existingStatus = await ctx.get("status");
      if (existingStatus && existingStatus !== STATUS.REJECTED) {
        return { isNew: false };
      }

      const now = new Date().toISOString();
      ctx.set("lead", input.lead);
      ctx.set("status", STATUS.NEW);
      ctx.set("lastTouchAt", now);
      if (!existingStatus) {
        ctx.set("firstSeenAt", now);
        if (input.reason) {
          ctx.set("reason", input.reason);
        }
      }
      return { isNew: true };
    },

    /** Digest this lead to Telegram, then park it in the pipeline. */
    notify: async (ctx: ObjectContext): Promise<void> => {
      const lead = await ctx.get("lead");
      if (!lead) notFound();
      const reason = (await ctx.get("reason")) ?? undefined;

      // Side effect journaled + retried by Restate until Telegram accepts.
      await sendLeadDigest({ ...lead, reason });

      ctx.set("status", STATUS.NOTIFIED);
      ctx.set("lastTouchAt", new Date().toISOString());
    },

    /** Set lifecycle status (e.g. from Polaris chat commands). */
    setStatus: async (ctx: ObjectContext, status: Status): Promise<void> => {
      ctx.set("status", status);
      ctx.set("lastTouchAt", new Date().toISOString());
    },

    /** Attach the drafted outreach message before requesting approval. */
    setDraft: async (ctx: ObjectContext, draft: string): Promise<void> => {
      ctx.set("draft", draft);
    },

    /** Inspect one lead — handy for Polaris slash commands and debugging. */
    get: async (
      ctx: ObjectContext,
    ): Promise<Partial<RegistryState>> => ({
      lead: (await ctx.get("lead")) ?? undefined,
      reason: (await ctx.get("reason")) ?? undefined,
      draft: (await ctx.get("draft")) ?? undefined,
      status: (await ctx.get("status")) ?? undefined,
      firstSeenAt: (await ctx.get("firstSeenAt")) ?? undefined,
      lastTouchAt: (await ctx.get("lastTouchAt")) ?? undefined,
    }),
  },
});

/** Helper shared by workflows: should this candidate be pursued at all? */
export function candidateIsPursuable(candidate: { url: string }): boolean {
  const domain = domainOf(candidate.url);
  return Boolean(domain) && !isBlacklisted(domain!);
}
