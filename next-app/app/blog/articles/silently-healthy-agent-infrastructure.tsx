import Link from "next/link";

const failureCases = [
  {
    id: "bot",
    title: "The bot that logged \u201clistening\u201d and never replied",
    symptom:
      "Container Up, logs say \u201cC2C is listening on Telegram\u201d, every poll appears to succeed \u2014 and no passenger message ever gets an answer.",
    cause:
      "The bot service was missing the ~/.claude OAuth mount the api service had. Every intake model call ran unauthenticated, failed after five retries, and was swallowed as \u201cpoll failed, retrying\u201d \u2014 a line that looks like transient noise.",
    find:
      "claude auth status inside the bot container reported loggedIn: false while the api container reported true. One volume mount fixed it.",
  },
  {
    id: "token",
    title: "The token that Telegram rejected with a swallowed 404",
    symptom:
      "Bot authenticates to start, polls happily, and receives nothing. Logs are clean.",
    cause:
      "The bot token in .env had extra characters pasted onto it. Telegram returns HTTP 404 for a malformed token \u2014 and getUpdates parses the 404 body as \u201cno updates\u201d, so the loop never raises. The bot is healthy and deaf at the same time.",
    find:
      "getMe returned 404 while getUpdates returned ok:false with zero updates. One corrected token and a container recreate fixed it.",
  },
  {
    id: "network",
    title: "The network that looked fine from the host",
    symptom:
      "Every container Up and healthy, host egress fast, docker0 egress fast \u2014 and the compose network silently unable to reach anything.",
    cause:
      "A stale legacy iptables ruleset with FORWARD policy DROP coexisted with Docker\u2019s correct nftables rules and only knew about docker0. Traffic was accepted, then dropped a millisecond later by the other ruleset.",
    find:
      "A NAT MASQUERADE counter stuck at zero while FORWARD counters ticked. Told in full in our post on the legacy iptables egress bug.",
  },
];

function Ref({ n }: { n: number }) {
  return (
    <sup className="blog-ref">
      <a href={`#source-${n}`}>[{n}]</a>
    </sup>
  );
}

export default function SilentlyHealthyAgentInfrastructure() {
  return (
    <>
      <h2 id="the-pattern">The failure class: components that report health and do nothing</h2>
      <p>
        <strong>Every long-running agent stack eventually produces the same failure class: a component that logs
        &ldquo;I&rsquo;m fine&rdquo; while silently doing nothing that matters.</strong> The process is up. The health
        endpoint returns 200. The logs are quiet. And the work is not happening.
      </p>
      <p>
        While wiring up a Telegram demo for our agent stack, three different failures hit us in a single afternoon,
        and all three wore the same disguise: a component that looked healthy, was trusted on that basis, and was
        doing nothing.<Ref n={1} />
      </p>

      <div className="blog-table-wrap">
        <table className="blog-table">
          <thead>
            <tr>
              <th>Component</th>
              <th>Looked like</th>
              <th>Was actually</th>
            </tr>
          </thead>
          <tbody>
            {failureCases.map((row) => (
              <tr key={row.id}>
                <td><strong>{row.title}</strong></td>
                <td>{row.symptom}</td>
                <td>{row.cause}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 id="case-1">Case 1: the bot that logged &ldquo;listening&rdquo;</h2>
      <p>
        Our Telegram bot runs in a container. It starts, prints{" "}
        <code>C2C is listening on Telegram</code>, and begins long-polling <code>getUpdates</code>. It is the
        system&apos;s public face — a passenger describes a disruption, the bot answers, a case is opened.
      </p>
      <p>
        The intake step that understands a passenger&apos;s message calls the model. In the container, that call
        shells out to <code>claude -p</code> — which needs the OAuth login the <em>api</em> container had mounted
        in, but the <em>bot</em> container did not. Unauthenticated, the call failed five times, and the failure was
        caught by the poll loop&apos;s blanket <code>except</code> and printed as{" "}
        <code>poll failed, retrying</code> — a line you read as transient network noise and move past.
      </p>
      <pre className="blog-code blog-code-good"><code>{`# the one-line fix: give the bot the same login the api service has
volumes:
  - \${HOME}/.claude:/root/.claude
  - \${HOME}/.claude.json:/root/.claude.json`}</code></pre>
      <p>
        The interesting part is not the missing mount. It is that <strong>the bot had no way to be wrong loudly</strong>:
        the failure was caught, retried, and reduced to a log line indistinguishable from a slow network. The system
        kept every promise its process could make — and delivered nothing to the passenger.
      </p>

      <h2 id="case-2">Case 2: the swallowed 404</h2>
      <p>
        Then the token broke. A token pasted into <code>.env</code> had extra characters on the end — the sort of
        edit that happens at 11pm before a demo. Telegram is strict: any token that is not byte-exact gets{" "}
        <code>404 Not Found</code> on every call.
      </p>
      <p>
        And here is the trap: <code>getUpdates</code> does not raise on that 404. It parses the response, sees{" "}
        <code>ok: false</code>, and returns an empty update list. The poll loop sees an empty list and keeps polling
        forever. <strong>The bot authenticates at startup, polls happily, and is permanently deaf</strong> — with
        clean logs. Only <code>getMe</code>, which asks Telegram to identify the token, exposed it.
      </p>

      <h2 id="case-3">Case 3: the network that lied from the host</h2>
      <p>
        The third failure we have written up separately, because it deserves the space: a stale legacy iptables
        ruleset dropped the compose network&apos;s outbound traffic while Docker&apos;s own rules and the host&apos;s
        routing both looked perfect. The container could talk to its siblings and the host had full egress — only
        the path that mattered, container to the internet, was dead.
      </p>
      <p>
        That one is the purest example of the pattern: every standard diagnostic returned healthy, and the system was
        doing nothing.<Ref n={2} />
      </p>

      <h2 id="the-fix">The fix: check the remote end, not the local report</h2>
      <p>
        All three failures share one remedy, and it is a habit rather than a tool: <strong>ask the remote end what it
        sees.</strong> Self-reported state — a process that started, a log line, a health endpoint the component
        writes itself — tells you the component is alive. It says nothing about whether the work is happening.
      </p>
      <ul className="blog-list">
        <li>For the token: <code>getMe</code>. Telegram itself says whether the token is valid. <code>getUpdates</code> swallows the answer.</li>
        <li>For the network: a <code>curl</code> from inside the container to the actual endpoint. It tests the whole path, not the config.</li>
        <li>For the model: the PONG probe — a one-line model call that must return before you trust anything downstream of the model.</li>
      </ul>
      <aside className="blog-callout blog-callout-principle">
        <span className="blog-callout-label">The core principle</span>
        <p>
          &ldquo;Up&rdquo; and &ldquo;working&rdquo; are different claims. A process that started successfully and a
          pipeline that is delivering results have almost nothing in common, and the first must never be treated as
          evidence of the second. When a demo is on the line, verify the delivery path end to end — and verify it
          again after any config edit.
        </p>
      </aside>

      <h2 id="operational-checks">A pre-demo checklist that would have caught all three</h2>
      <div className="blog-table-wrap">
        <table className="blog-table">
          <thead>
            <tr>
              <th>Step</th>
              <th>Command</th>
              <th>What it proves</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Token valid</td>
              <td><code>curl -s https://api.telegram.org/bot$TOKEN/getMe</code></td>
              <td>Telegram accepts the token (200, not 404)</td>
            </tr>
            <tr>
              <td>Container egress</td>
              <td><code>docker compose exec api curl -sS https://api.anthropic.com</code></td>
              <td>The whole network path works from where the code runs</td>
            </tr>
            <tr>
              <td>Model reachable</td>
              <td><code>claude -p &quot;Reply with exactly: PONG&quot;</code></td>
              <td>The model answers before anything else is trusted</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="sources">Sources</h2>
      <ol className="blog-sources">
        <li id="source-1">
          <a href="https://core.telegram.org/bots/api#getupdates" target="_blank" rel="noopener noreferrer">
            getUpdates — Telegram Bot API
          </a>
        </li>
        <li id="source-2">
          <Link href="/blog/docker-compose-egress-legacy-iptables">Docker Compose egress and the stale legacy iptables ruleset</Link>
        </li>
      </ol>
    </>
  );
}
