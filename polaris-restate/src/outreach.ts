import * as restate from "@restatedev/restate-sdk";
import { leadRegistry } from "./lead-registry.js";
import { STATUS } from "./registry.js";
import { hermesExecute } from "./hermes.js";
import { sendMessage } from "./telegram.js";

/**
 * Human-in-the-loop outreach, straight from the blog example:
 *
 *   Hermes drafts personalized outreach for a qualified lead -> the
 *   invocation suspends on a durable promise -> you reply in Telegram
 *   with approve / reject -> Polaris resolves the promise over HTTP ->
 *   the pipeline resumes and sends (or drops) the message.
 *
 * Waiting costs nothing: Restate suspends the invocation until resolved,
 * hours or days later. The invocation ID is delivered to Telegram in the
 * approval prompt so any chat client can complete it.
 */
export const outreachWorkflow = restate.workflow({
  name: "Outreach",
  handlers: {
    run: async (
      ctx: restate.WorkflowContext,
      input: { fingerprint: string; url: string },
    ): Promise<{ sent: boolean }> => {
      const fp = input.fingerprint;

      const draft = await ctx.run(`hermes: draft outreach ${fp}`, () =>
        hermesExecute(
          [
            `Draft a short (max 120 words) cold outreach email to a prospect company.`,
            `Context: we found this public page about them: ${input.url}`,
            `We offer: (a) custom AI agent builds, (b) quantum-inspired QUBO optimization for routing/scheduling/portfolio problems.`,
            `Rules: reference their specific problem, no buzzwords, one clear call to action, sign as "Yabloko Labs".`,
          ].join(" "),
        ),
      );

      await ctx.objectClient(leadRegistry, fp).setDraft(draft);

      // Deliver the draft + approval affordance to Telegram.
      const invocationId = ctx.request().id;
      await ctx.run(`telegram: request approval ${fp}`, () =>
        sendMessage(
          [
            `✍️ <b>Outreach draft ready</b> for <code>${fp}</code>`,
            "",
            draft.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"),
            "",
            `<b>Approve:</b> <code>curl -X POST localhost:8080/Outreach/${fp}/resolve --json '"approve"'</code>`,
            `<b>Reject:</b> <code>curl -X POST localhost:8080/Outreach/${fp}/resolve --json '"reject"'</code>`,
            `(invocation ${invocationId})`,
          ].join("\n"),
        ),
      );

      // Suspend — durable promise, resolvable from any handler or HTTP.
      const decision = await ctx.promise<string>("approval");

      if (decision !== "approve") {
        await ctx.objectClient(leadRegistry, fp).setStatus(STATUS.REJECTED);
        return { sent: false };
      }

      await ctx.run(`send outreach ${fp}`, () =>
        sendMessage(`📤 Outreach for <code>${fp}</code> approved — handing to your send step.`),
      );
      // Wire your real sending channel (email API, LinkedIn, ...) into here;
      // it runs exactly once even if the process dies right after.

      await ctx.objectClient(leadRegistry, fp).setStatus(STATUS.OUTREACH_SENT);
      return { sent: true };
    },

    /** Resolve the approval promise from chat commands or automation. */
    resolve: async (
      ctx: restate.WorkflowSharedContext,
      decision: string,
    ): Promise<void> => {
      await ctx.promise<string>("approval").resolve(decision);
    },
  },
});
