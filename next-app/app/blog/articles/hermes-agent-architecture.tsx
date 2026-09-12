import MermaidDiagram from "../components/MermaidDiagram";

const overviewSource = `flowchart TD
  subgraph L1["SURFACES — clients"]
    CLI["CLI REPL + ACP + batch<br/>cli.py · acp_adapter · batch_runner"]
    TUI["TUI + Desktop<br/>ui-tui · apps/desktop"]
    MSG["Messaging apps<br/>~20 platform adapters"]
  end
  subgraph L2["SERVING — sessions and transports"]
    TGW["tui_gateway/server.py<br/>JSON-RPC backend"]
    GWR["gateway/run.py<br/>facade + run_* phases"]
    WEB["web_server.py<br/>24 FastAPI routers"]
    CRN["cron/scheduler.py<br/>jobs + kanban"]
  end
  subgraph L3["AGENT CORE — the narrow waist"]
    AGT["run_agent.py<br/>AIAgent facade"]
    TRN["agent/turn_*.py<br/>turn loop phases"]
    PRV["agent/ providers<br/>model + aux adapters"]
    MEM["memory + skills<br/>manager · curator"]
  end
  subgraph L4["CAPABILITY EDGES"]
    TLS["tools/registry.py + toolsets.py<br/>discovery + _HERMES_CORE_TOOLS"]
    PLG["plugins/<br/>native extensions"]
    MCP["MCP catalog<br/>optional-mcps/"]
  end
  subgraph L5["STATE AND SUBSTRATE"]
    SDB["hermes_state*.py<br/>SessionDB + 20 siblings"]
    HOM["user home<br/>config.yaml · .env · logs"]
    ENV["tools/environments/<br/>local · docker · ssh · ..."]
  end
  CLI -- "drives turns in-process" --> AGT
  TUI -- "JSON-RPC methods_*" --> TGW
  TGW -- "hosts sessions, spawns turns" --> AGT
  WEB -- "embeds the real TUI" --> TGW
  MSG -- "adapters, 2 inbound guards" --> GWR
  GWR -- "runs turns per session" --> AGT
  CRN -- "wakes session turns" --> GWR
  AGT -- "iterates" --> TRN
  TRN -- "streams model calls" --> PRV
  TRN -- "dispatches handle_function_call" --> TLS
  MEM -- "learns across sessions" --> SDB
  PLG -- "registers tools + platforms" --> TLS
  PLG -- "registers adapters" --> GWR
  MCP -- "adds catalog servers" --> TLS
  AGT -- "persists sessions" --> SDB
  SDB -- "lives in" --> HOM
  TLS -- "runs shell via" --> ENV
  class CLI,TUI,MSG surf;
  class TGW,GWR,WEB,CRN serv;
  class AGT,TRN,PRV,MEM core;
  class TLS,PLG,MCP edge;
  class SDB,HOM,ENV store;
  classDef surf fill:#dbeafe,stroke:#1e40af,color:#1e3a8a;
  classDef serv fill:#cffafe,stroke:#0e7490,color:#155e75;
  classDef core fill:#fef3c7,stroke:#b45309,color:#92400e;
  classDef edge fill:#dcfce7,stroke:#15803d,color:#166534;
  classDef store fill:#e2e8f0,stroke:#475569,color:#334155;`;

const turnSource = `flowchart TD
  IN["inbound user event"] -- "queues" --> G1["guard 1 · adapter queue<br/>holds while session active"]
  G1 -- "admits" --> G2["guard 2 · runner intercept<br/>stop · new · approve · deny"]
  G2 -- "passes checks" --> PRE["turn preflight<br/>budget · liveness · cache scope"]
  PRE -- "builds" --> ASM["prompt assembly<br/>byte-stable system prompt"]
  ASM -- "sends" --> MDL["provider call<br/>streaming response"]
  MDL -- "returns" --> ANY["tool calls?"]
  ANY -- "yes" --> EXE["execute tools<br/>approvals + check_fn gates"]
  EXE -- "results re-enter prompt" --> ASM
  ANY -- "no" --> FIN["final response"]
  FIN -- "delivers" --> DEL["deliver + persist<br/>SessionDB"]
  CMP["compression<br/>only cache exception"] -. "rewrites prefix when full" .-> ASM
  class IN,G1,G2 serv2;
  class PRE,ASM,MDL,ANY core2;
  class EXE,FIN,DEL edge2;
  class CMP store2;
  classDef serv2 fill:#cffafe,stroke:#0e7490,color:#155e75;
  classDef core2 fill:#fef3c7,stroke:#b45309,color:#92400e;
  classDef edge2 fill:#dcfce7,stroke:#15803d,color:#166534;
  classDef store2 fill:#e2e8f0,stroke:#475569,color:#334155;`;

const routingRows = [
  { area: "Agent loop", start: "agent/AGENTS.md", covers: "Turn phases, caching integrity, compression, model resolution" },
  { area: "CLI", start: "hermes_cli/AGENTS.md", covers: "Mixins, slash dispatch, config, skins, updater, profiles" },
  { area: "Gateway", start: "gateway/AGENTS.md", covers: "Adapters, two guards, streaming contract, lifecycle" },
  { area: "Tools", start: "tools/AGENTS.md", covers: "Registry, toolsets, delegation, terminal backends" },
  { area: "Plugins", start: "plugins/AGENTS.md", covers: "Plugin kinds, native compat contract, in-tree policy" },
  { area: "TUI", start: "tui_gateway/AGENTS.md", covers: "Process model, JSON-RPC transport, slash flow" },
  { area: "Skills / Cron", start: "skills/AGENTS.md · cron/AGENTS.md", covers: "Skill frontmatter and curator; scheduler invariants, kanban" },
];

const ladder = [
  "Extend existing code — zero new surface.",
  "CLI command plus skill — hermes <subcommand> guided by a skill.",
  "Service-gated tool — a check_fn probe shows it only when configured.",
  "Plugin — third-party or niche, discovered at runtime.",
  "MCP server in the catalog — zero permanent core-schema footprint.",
  "New core tool — last resort only.",
];

const sources = [
  {
    title: "Hermes Agent documentation",
    href: "https://hermes-agent.nousresearch.com/",
  },
  {
    title: "Fallback Providers — Hermes Agent documentation",
    href: "https://hermes-agent.nousresearch.com/docs/user-guide/features/fallback-providers",
  },
  {
    title: "Quickstart — Hermes Agent documentation",
    href: "https://hermes-agent.nousresearch.com/docs/getting-started/quickstart",
  },
];

function Ref({ n }: { n: number }) {
  return (
    <sup className="blog-ref">
      <a href={`#source-${n}`}>[{n}]</a>
    </sup>
  );
}

export default function HermesAgentArchitecture() {
  return (
    <>
      <p className="blog-lead">
        <strong>Hermes meets you in different places</strong> — a terminal prompt, a chat
        thread, a desktop window. Underneath it is one agent core running every turn.
      </p>
      <p>
        This post is the map we wish we had on day one: the five layers of the system, the
        path one request takes through a turn, and the rulebook that decides where new code
        belongs. Both diagrams are interactive — zoom and pan them — and each carries a text
        version for readers without JavaScript.
      </p>

      <h2 id="one-core-four-doors">One core, four doors</h2>
      <p>
        The top of the map is surfaces: the CLI REPL (plus IDE and batch runners), the
        terminal UI and desktop app, and around twenty messaging-platform adapters. None of
        them contains agent logic. Each one reaches the same <code>run_agent.py</code> core
        through a session layer — the CLI drives turns in-process, the TUI and desktop app
        talk to a JSON-RPC backend, the dashboard embeds the real TUI instead of rebuilding
        it, and chat messages arrive through gateway adapters.
      </p>
      <p>
        Below the core sit the capability edges — the tool registry, plugins, and the MCP
        catalog — and at the bottom the state layer: the session database, the user home
        directory, and the terminal backends that run shell commands.
      </p>

      <figure className="blog-figure">
        <MermaidDiagram
          source={overviewSource}
          label="Layered architecture: surfaces connect through serving layers to the agent core, which uses capability edges and persists to state"
        />
        <figcaption>
          One agent core, many surfaces: every client reaches <code>run_agent.py</code>{" "}
          turns through a session layer, while new capability attaches at the edges — never
          as new core surface.
        </figcaption>
        <details className="blog-figure-fallback">
          <summary>Text version of this diagram</summary>
          <p>
            Five layers, top to bottom. <strong>Surfaces:</strong> CLI REPL plus IDE and
            batch runners; TUI plus desktop app; messaging apps on platform adapters.{" "}
            <strong>Serving:</strong> the JSON-RPC backend hosts sessions and spawns turns;
            the gateway runs one turn per session behind two inbound guards; the dashboard
            API embeds the real TUI; the scheduler wakes session turns for cron and kanban.{" "}
            <strong>Agent core:</strong> the AIAgent facade iterates turn phases, streams
            model calls through provider adapters, and learns across sessions through
            memory and skills. <strong>Capability edges:</strong> the tool registry and
            shared core toolset, native plugins registering tools and adapters, and MCP
            catalog servers. <strong>State:</strong> the session database persists turns
            into the user home directory, and shell tools run through terminal backends.
          </p>
        </details>
      </figure>

      <h2 id="what-a-turn-does">What a turn actually does</h2>
      <p>
        Zoom into any arrow that says “runs turns” and you get the second diagram. An
        inbound event passes two guards: the adapter holds it while the session is active,
        and the runner intercepts control commands — stop, new, approve, deny — before they
        can reach a running agent. Preflight checks budgets and liveness, then the prompt
        is assembled.
      </p>
      <p>
        That prompt is byte-stable for the life of the conversation, which is what keeps
        the provider cache warm. The model streams a response; tool calls execute under
        approvals and service gates, and their results re-enter the prompt for another
        round. When no more tool calls remain, the final response is delivered and
        persisted. The only thing ever allowed to rewrite the cached prefix is context
        compression, when the conversation outgrows the window.
      </p>

      <figure className="blog-figure">
        <MermaidDiagram
          source={turnSource}
          label="Turn flow: inbound event passes two guards, preflight, prompt assembly, provider call, tool loop, final delivery"
        />
        <figcaption>
          A turn is a guarded loop: two inbound guards admit the event, a byte-stable
          prompt protects the cache, and tool rounds repeat until a final response is
          delivered and persisted.
        </figcaption>
        <details className="blog-figure-fallback">
          <summary>Text version of this diagram</summary>
          <p>
            Inbound user event → guard 1 (adapter queue holds while the session is active)
            → guard 2 (runner intercepts stop, new, approve, deny) → turn preflight
            (budget, liveness, cache scope) → prompt assembly (byte-stable system prompt)
            → provider call (streaming response) → tool calls? Yes: execute tools under
            approvals and check_fn gates, and results re-enter prompt assembly. No: final
            response → deliver and persist to the session database. Compression is the only
            cache exception: it rewrites the prompt prefix when the window fills.
          </p>
        </details>
      </figure>

      <h2 id="two-rules">The two rules that shape every change</h2>
      <p>
        Two invariants explain most of the design — and most review feedback:
      </p>
      <aside className="blog-callout">
        <span className="blog-callout-label">Per-conversation prompt caching is sacred</span>
        <p>
          A long-lived conversation reuses a cached prefix on every turn. Anything that
          mutates past context, swaps toolsets, or rebuilds the system prompt
          mid-conversation multiplies cost. Slash commands that change skills, tools, or
          memory therefore defer invalidation to the next session, with an opt-in{" "}
          <code>--now</code> flag.
        </p>
      </aside>
      <aside className="blog-callout">
        <span className="blog-callout-label">The core is a narrow waist</span>
        <p>
          Every model tool ships on every API call, so the bar for new core surface is
          high. New capability climbs the footprint ladder from the top:
        </p>
        <ol className="blog-list blog-list-ordered">
          {ladder.map((rung) => (
            <li key={rung}>{rung}</li>
          ))}
        </ol>
      </aside>

      <h2 id="where-things-live">Where things live</h2>
      <p>
        Each area of the codebase opens with its own guide for contributors. Working in an
        area means reading its guide first:
      </p>
      <div className="blog-table-wrap">
        <table className="blog-table">
          <thead>
            <tr>
              <th>Area</th>
              <th>Start here</th>
              <th>Covers</th>
            </tr>
          </thead>
          <tbody>
            {routingRows.map((row) => (
              <tr key={row.area}>
                <td>
                  <strong>{row.area}</strong>
                </td>
                <td>
                  <code>{row.start}</code>
                </td>
                <td>{row.covers}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p>
        The throughline: expansive at the edges, conservative at the waist. Fix real bugs
        against the exact line where they manifest, prove behavior end to end rather than
        behind mocks, and keep every turn cache-safe.
        <Ref n={1} />
      </p>

      <ol className="blog-sources">
        {sources.map((source, index) => (
          <li key={source.href} id={`source-${index + 1}`}>
            <a href={source.href} rel="noopener">
              {source.title}
            </a>
          </li>
        ))}
      </ol>
    </>
  );
}
