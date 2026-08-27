import Link from "next/link";

const architectureRows = [
  {
    layer: "Simple request",
    path: "normal agent loop",
    dies: "Process restarts mid-task lose all progress",
  },
  {
    layer: "Durable task",
    path: "Hermes runs the loop inside Restate",
    dies: "Every step is journaled and resumed after a crash",
  },
];

const restatePillars = [
  {
    title: "LLM calls",
    id: "llm-calls",
    ref: 1,
    what: "Responses persisted in the journal, replayed on recovery",
    how: "ctx.run(\"LLM call\", …) or durableCalls(ctx) middleware",
  },
  {
    title: "MCP / tools",
    id: "mcp-tools",
    ref: 2,
    what: "Side effects run exactly once even across retries",
    how: "Wrap each tool execution in ctx.run()",
  },
  {
    title: "Time",
    id: "time",
    ref: 3,
    what: "Timers survive restarts — no cron sprawl, no lost sleeps",
    how: "await ctx.sleep(ms) between durable steps",
  },
  {
    title: "Human in the loop",
    id: "human-loop",
    ref: 3,
    what: "Suspend for hours or days; resume on approval signal",
    how: "Signals, awakeables, workflow promises",
  },
  {
    title: "Observability",
    id: "observability",
    ref: 1,
    what: "Step-by-step trace of every LLM call, tool run, and wait",
    how: "Restate UI at localhost:9070",
  },
];

const failureTimeline = [
  {
    step: "1 · Fan-out",
    plain: "Three MCP tools fire — web_search, browser tool, git clone. Process is killed by an OOM killer.",
    restate: "Each fan-out is a ctx.run step; a new worker replays the journal and only re-runs unfinished steps.",
  },
  {
    step: "2 · Provider blip",
    plain: "Rate limit kills the synthesis call; whole research task restarts from zero.",
    restate: "ctx.run retries with backoff; on success the response is journaled and never refetched.",
  },
  {
    step: "3 · Scheduled check",
    plain: "\"Check back tomorrow\" is impossible without external crons and glue code.",
    restate: "await ctx.sleep(duration) — timer survives restarts; Restate wakes the task.",
  },
  {
    step: "4 · Human approval",
    plain: "Agent blocks or polls; state lives in chat history that may be gone next week.",
    restate: "Task suspends on a signal/awakeable; approvals arrive over HTTP to resume it.",
  },
];

const primitives = [
  {
    name: "Signal",
    address: "invocation ID + signal name",
    useFor: "One-off approvals, agent steering (\"stop searching, write up\")",
  },
  {
    name: "Awakeable",
    address: "generated one-shot ID",
    useFor: "Callback tokens handed to an external system",
  },
  {
    name: "Workflow promise",
    address: "workflow key + promise name",
    useFor: "Shared results any workflow handler can read during retention",
  },
];

const env = "$ npm install --global @restatedev/restate-server@latest @restatedev/restate@latest\n" +
  "$ restate-server &            # ingress :8080 · UI :9070\n" +
  "$ npm install @restatedev/restate-sdk\n" +
  "$ restate deployments register http://localhost:9080";

const roadmap = [
  { stage: "Simple request", detail: "one prompt, one reply — keep Hermes exactly as it is", ok: true },
  { stage: "Long research briefing", detail: "durable context, from-there recovery instead of a do-over", ok: true },
  { stage: "Watchtower / monitor", detail: "service per watched project; delayed wake-up for re-checks", ok: true },
  { stage: "Human-approval gate", detail: "agent suspends days if needed; resumes when you resolve its awakeable", ok: false },
  { stage: "Self-healing pipeline", detail: "object registered inside the loop; every cycle for free forever", ok: false },
];

function Ref({ n }: { n: number }) {
  return (
    <sup className="blog-ref">
      <a href={`#source-${n}`}>[{n}]</a>
    </sup>
  );
}

export default function HermesRestateDurableTasks() {
  return (
    <>
      <h2 id="hermes-today">Hermes today: great at requests, silent between them</h2>
      <p>
        <strong>Hermes is superb at the request/response shape of agentic work:</strong> you type a message, it
        executes tools across multiple reasoning turns and replies.<Ref n={4} /> When the process stays alive, this works
        beautifully.
      </p>
      <p>
        But some of the most valuable work you&apos;d want from an agent doesn&apos;t fit that shape:
      </p>
      <ul className="blog-list">
        <li>research tasks that take longer than your SSH session,</li>
        <li>agents watching a repo and acting hours later,</li>
        <li>pipelines where each stage needs sign-off before continuing.</li>
      </ul>

      <div className="blog-table-wrap">
        <table className="blog-table">
          <thead>
            <tr>
              <th>Execution model</th>
              <th>Mechanics</th>
              <th>What happens when the process dies</th>
            </tr>
          </thead>
          <tbody>
            {architectureRows.map((row) => (
              <tr key={row.layer}>
                <td><strong>{row.layer}</strong></td>
                <td>{row.path}</td>
                <td>{row.dies}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p>
        We have already solved part of this puzzle in-house: when a provider dies mid-turn, Hermes switches models on
        a properly separated fallback chain (see{" "}
        <Link href="/blog/hermes-provider-fallbacks">Hermes Provider Fallbacks</Link>). That fixes the model hop.
        It does nothing for every other way a long task can fall over.
      </p>

      <h2 id="what-restate-adds">What Restate adds around Hermes</h2>
      <p>
        <strong>Durable execution</strong>. Your Hermes loop becomes a Restate handler. As it runs, Restate journals
        each step; on crash or restart, a fresh process replays the journal — completed steps are skipped, in-flight
        ones resume. No special infrastructure, no workflow DSL: plain TypeScript functions with a{" "}
        <code>ctx</code>.<Ref n={1} />
      </p>

      <pre className="blog-code"><code>{env}</code></pre>

      <p>
        After registration, every invocation is durable and observable at <code>localhost:9070</code> — no extra
        telemetry wiring needed.<Ref n={3} />
      </p>

      <pre className="blog-code blog-code-good"><code>{`Simple request              Durable task
     │                           │
     ▼                           ▼
normal agent loop            Restate runtime
                                 │
          ┌──────────────────────┼──────────────────────┐
          ▼                      ▼                      ▼
         LLM                    MCP                   Agents
          │                      │                      │
          └─────────── durable execution ──────────────┘
                                 │
                            wait / schedule
                                 │
                           human approval
                                 │
                              resume`}</code></pre>

      <h2 id="the-five-pillars">The five pillars, concretely</h2>
      <div className="blog-table-wrap">
        <table className="blog-table">
          <thead>
            <tr>
              <th>Pillar</th>
              <th>What you get</th>
              <th>How it&apos;s expressed</th>
            </tr>
          </thead>
          <tbody>
            {restatePillars.map((pillar) => (
              <tr key={pillar.id}>
                <td><strong>{pillar.title}</strong></td>
                <td>
                  {pillar.what}
                  <Ref n={pillar.ref} />
                </td>
                <td><code>{pillar.how}</code></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 id="getting-started">Getting started with Hermes + Restate</h2>
      <p>
        The details below describe our target stack. If you reproduce this before we publish part two, expect small
        API drift.
      </p>
      <p>
        Before adding durability, prove that Hermes works plainly:<Ref n={4} />
      </p>
      <pre className="blog-code"><code>{`hermes --version
hermes model           # confirm primary provider
hermes chat -q "Reply with PRIMARY_OK"`}</code></pre>

      <h2 id="examples">Two concrete examples</h2>

      <h3 id="example-watcher">Example 1 — a durable repo watcher</h3>
      <p>
        The pattern: register one durable workflow per watched repository. Its run handler fires up a long-lived
        loop, and each wake-up gets its own journaled start-to-finish. In the sketch below,{" "}
        <code>hermesExecute</code> stands in for Hermes doing real work; swap in the calls your Hermes deployment uses
        there.
      </p>

      <pre className="blog-code"><code>{`import * as restate from "@restatedev/restate-sdk";
import { hermesExecute } from "./hermes-adapter"; // thin wrapper around your Hermes invocation

// One durable workflow run (one key) per watched repository.
export const repoWatcher = restate.workflow({
  name: "RepoWatcher",
  handlers: {
    // POST /RepoWatcher/{repoUrl}/run — starts watching one repo
    run: async (ctx: restate.WorkflowContext, repoUrl: string) => {
      const label = \`watcher:\${repoUrl}\`;

      while (true) {
        // Durable wait — suspends the task completely, survives restarts
        await ctx.sleep(6 * 60 * 60 * 1000); // 6 hours

        // Durable step — journaled, retried until success, never duplicated
        const commits = await ctx.run(\`\${label}: fetch new commits\`, () =>
          fetchNewCommits(repoUrl)
        );
        if (commits.length === 0) continue;

        const review = await ctx.run(\`\${label}: Hermes review\`, () =>
          hermesExecute({ prompt: buildReviewPrompt(repoUrl, commits) })
        );

        await ctx.run(\`\${label}: publish notes\`, () =>
          postToTeamChannel(review, repoUrl)
        );
      }
    },
  },
});

restate.serve({ services: [repoWatcher], port: 9080 });`}</code></pre>

      <p>
        Each branch — <code>LLM</code>, <code>MCP</code>, <code>Agents</code> in the diagram above — can fail
        independently, yet the watcher keeps its place. A deploy in the middle changes nothing: on restart, Restate
        replays completed steps like <code>fetchNewCommits</code> and continues from wherever the journal says it
        stopped.
      </p>

      <h3 id="example-pipeline">Example 2 — an agent pipeline with human approval</h3>
      <p>
        Multi-stage agents often need human sign-off between stages. With Restate, waiting for approval is cheap and
        suspends rather than consumes a machine: the task parks, survives restarts, and resumes once you approve.
      </p>

      <pre className="blog-code"><code>{`// Inside the same durable pipeline: draft -> review -> publish
export const contentPipeline = restate.service({
  name: "ContentPipeline",
  handlers: {
    produceDraft: async (ctx: restate.Context, topic: string) => {
      const draft = await ctx.run("hermes draft", () =>
        hermesExecute({ prompt: \`Write a technical deep-dive on \${topic}.\` })
      );

      // Build an external callback token, then hand it to a reviewer
      const { id, promise } = ctx.awakeable<string>();
      await ctx.run("notify reviewer", () => sendSlackReviewRequest(topic, draft, id));
      // Task suspends here — minutes, hours, or days cost nothing

      // Approver resolves over HTTP:
      // curl $RESTATE/awakeables/<id>/resolve --json '"Approved"'
      const decision = await promise;
      if (decision !== "Approved") throw new restate.TerminalError("Rejected");

      return ctx.run("publish", () => publishPost(draft));
    },
  },
});`}</code></pre>

      <aside className="blog-callout blog-callout-principle">
        <span className="blog-callout-label">The core principle</span>
        <p>
          Waiting must not consume compute. When a Hermes task has nothing to do but wait — for a scheduled time, a
          tool result, or a human — Restate suspends it and resumes on the event.
        </p>
      </aside>

      <h3 id="connecting-mcp">Connecting MCP servers through Restate</h3>
      <p>
        Hermes can connect to external tool servers so the agent can use tools living outside Hermes itself — GitHub,
        databases, file systems, browsers.<Ref n={2} /> Wrap each such side effect in <code>ctx.run()</code>, and the
        result is journaled. On recovery, the result is replayed rather than the call repeated, which keeps flaky
        third-party tools from duplicating writes:
      </p>

      <pre className="blog-code"><code>{`// Any SDK's MCP client works — the durability comes from the Restate context
async function mcpToolCall(
  ctx: restate.Context,
  server: string,
  toolName: string,
  args: Record<string, unknown>,
) {
  return ctx.run(\`MCP \${server}/\${toolName}\`, () =>
    mcpClient.callTool(server, toolName, args) // your Hermes-configured MCP client
  );
}`}</code></pre>

      <h2 id="plain-vs-restate">Plain Hermes vs. Hermes on Restate</h2>
      <div className="blog-table-wrap">
        <table className="blog-table">
          <thead>
            <tr>
              <th>Situation</th>
              <th>Plain Hermes</th>
              <th>Hermes + Restate</th>
            </tr>
          </thead>
          <tbody>
            {failureTimeline.map((row) => (
              <tr key={row.step}>
                <td><strong>{row.step}</strong></td>
                <td>{row.plain}</td>
                <td>{row.restate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 id="choosing-coordination">Choosing a coordination primitive</h2>
      <p>Restate offers three primitives for &ldquo;wait for something outside the loop&rdquo;:<Ref n={3} /></p>

      <div className="blog-table-wrap">
        <table className="blog-table">
          <thead>
            <tr>
              <th>Primitive</th>
              <th>Addressed by</th>
              <th>Best for</th>
            </tr>
          </thead>
          <tbody>
            {primitives.map((prim) => (
              <tr key={prim.name}>
                <td><strong>{prim.name}</strong></td>
                <td>{prim.address}</td>
                <td>{prim.useFor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <aside className="blog-callout blog-callout-warning">
        <span className="blog-callout-label">Don&apos;t hand-roll this</span>
        <p>
          Resist writing your own queue tables, outbox patterns, cron jobs, or webhook endpoints just to move agent
          state around. Every hour spent on Redis pub/sub plumbing is an hour not spent improving your agent. Restate
          exists precisely so you don&apos;t have to become a distributed-systems engineer to run agents past five
          minutes.
        </p>
      </aside>

      <h2 id="roadmap">Where we&apos;re taking it</h2>
      <p>
        This is no longer hypothetical: our Polaris assistant (a Hermes agent driven over Telegram) now runs a
        durable lead-discovery pipeline built exactly this way — a scheduled <code>ProspectLoop</code> workflow that
        scores candidates against our ICP with Hermes, dedupes them through a <code>LeadRegistry</code> virtual
        object, and drafts outreach behind an approval promise you resolve from chat.
      </p>
      <ul className="blog-checklist">
        {roadmap.map((item) => (
          <li key={item.stage}>
            <span className="blog-check" aria-hidden="true">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d={item.ok ? "M20 6L9 17l-5-5" : "M5 12h14"} />
              </svg>
            </span>
            <span>{item.stage} — {item.detail}</span>
          </li>
        ))}
      </ul>

      <h2 id="sources">Sources</h2>
      <ol className="blog-sources">
        <li id="source-1">
          <a href="https://docs.restate.dev/ai/patterns/durable-agents" target="_blank" rel="noopener noreferrer">
            Durable Agents — Restate documentation
          </a>
        </li>
        <li id="source-2">
          <a href="https://hermes-agent.nousresearch.com/docs/user-guide/features/mcp" target="_blank" rel="noopener noreferrer">
            MCP (Model Context Protocol) — Hermes Agent documentation
          </a>
        </li>
        <li id="source-3">
          <a href="https://docs.restate.dev/develop/ts/external-events" target="_blank" rel="noopener noreferrer">
            Signals and external events — Restate documentation
          </a>
        </li>
        <li id="source-4">
          <a href="https://hermes-agent.nousresearch.com/docs/getting-started/quickstart" target="_blank" rel="noopener noreferrer">
            Quickstart — Hermes Agent documentation
          </a>
        </li>
      </ol>
    </>
  );
}
