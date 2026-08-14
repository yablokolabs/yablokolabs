const chain = [
  {
    position: "Primary",
    route: "OpenAI Codex OAuth",
    domain: "Vendor account & subscription quota",
  },
  {
    position: "Fallback 1",
    route: "Hosted Qwen endpoint",
    domain: "Independent hosting & auth path",
  },
  {
    position: "Fallback 2",
    route: "Local OmniRoute free-model route",
    domain: "On-premise; no external dependency",
  },
];

const triggers = [
  { condition: "HTTP 429", behaviour: "Fails over after retries are exhausted" },
  { condition: "HTTP 500 / 502 / 503", behaviour: "Fails over after retries are exhausted" },
  { condition: "HTTP 401 / 403 / 404", behaviour: "Fails over immediately" },
  { condition: "Connection failure", behaviour: "Fails over" },
  { condition: "Malformed / empty response", behaviour: "Fails over after repeated occurrences" },
];

const failureDomainAxes = [
  "provider account or subscription",
  "API endpoint",
  "cloud region or hosting platform",
  "authentication path",
  "model family",
  "local versus hosted infrastructure",
];

const checklist = [
  "Primary provider works on its own",
  "Exact model IDs are pinned — no auto",
  "Fallbacks use genuinely different failure domains",
  "Every model passes a tool-call probe, not just a text completion",
  "Secrets stay out of config.yaml and out of any shared example",
  "hermes fallback list shows the intended order",
  "A fresh session loads the new chain",
  "Cost and context limits are acceptable on the backup routes",
];

const sources = [
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

export default function HermesProviderFallbacks() {
  return (
    <>
      <h2 id="why-fallbacks-matter">Why fallbacks matter</h2>
      <p>
        One failed LLM provider should not take your AI agent offline. Yet the most common failover setup — a second
        model behind the same router — fails at exactly the moment it is needed.
      </p>
      <p>
        This guide comes out of a real Hermes deployment. The primary Codex route hit a 429 quota limit. The backup
        router then returned 503 because it was at capacity. From the operator&apos;s chat interface, the agent simply
        looked frozen while both routes retried.
      </p>
      <p>
        Adding more retries would only have made the hang longer. What was needed was a fallback chain with genuinely
        different failure domains:
      </p>

      <div className="blog-table-wrap">
        <table className="blog-table">
          <thead>
            <tr>
              <th>Position</th>
              <th>Route</th>
              <th>Failure domain</th>
            </tr>
          </thead>
          <tbody>
            {chain.map((row) => (
              <tr key={row.position}>
                <td>
                  <strong>{row.position}</strong>
                </td>
                <td>{row.route}</td>
                <td>{row.domain}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p>
        Hermes can switch to another <code>provider:model</code> when the primary hits rate limits, server overload,
        authentication failures, connection problems, or repeated invalid responses. The conversation and tool context
        stay intact.
        <Ref n={1} />
      </p>

      <p>The complete setup was five commands:</p>

      <pre className="blog-code">
        <code>{`# Prove the primary works first
hermes model
hermes chat -q "Reply with PRIMARY_OK"

# Add backups in the order they should be tried
hermes fallback add
hermes fallback add

# Inspect the result
hermes fallback list`}</code>
      </pre>

      <p>
        <code>hermes fallback add</code> opens the same provider and model picker used by <code>hermes model</code>. It
        appends each selection to the <code>fallback_providers</code> chain without replacing the primary.
      </p>

      <aside className="blog-callout blog-callout-principle">
        <span className="blog-callout-label">The core principle</span>
        <p>
          A backup only counts if it fails differently. Two models behind one overloaded router still share a single
          point of failure.
        </p>
      </aside>

      <h2 id="setup">Setup</h2>

      <h3>1. Configure and prove the primary provider</h3>
      <p>
        Hermes recommends configuring the base provider before adding routing or fallback behaviour.
        <Ref n={2} />
      </p>

      <pre className="blog-code">
        <code>{`hermes --version
hermes model
hermes chat -q "Reply with PRIMARY_OK"`}</code>
      </pre>

      <p>
        Do not add fallbacks until the primary can complete a normal request. Otherwise you cannot tell whether a later
        success came from the intended route or from accidental failover.
      </p>

      <h3>2. Add fallback providers in order</h3>

      <pre className="blog-code">
        <code>{`hermes fallback add
hermes fallback add
hermes fallback list`}</code>
      </pre>

      <p>
        The first <code>add</code> becomes fallback 1, the next becomes fallback 2, and so on. The command reuses the
        Hermes provider/model picker and preserves the current primary model.
        <Ref n={1} />
      </p>

      <p>For the stack behind this guide, the public-safe shape is:</p>

      <pre className="blog-code">
        <code>{`Primary     openai-codex / gpt-5.6-sol
Fallback 1  custom / hosted Qwen tool-capable model
Fallback 2  custom / local OmniRoute free model`}</code>
      </pre>

      <p>The private base URLs and credentials are deliberately omitted.</p>

      <h3>3. Understand the custom-endpoint shape</h3>
      <p>
        For a custom OpenAI-compatible fallback, Hermes stores a real top-level YAML list. This is the canonical shape
        from the official documentation:
        <Ref n={1} />
      </p>

      <pre className="blog-code">
        <code>{`fallback_providers:
  - provider: custom
    model: hosted-qwen-tool-model
    base_url: https://llm.example.com/v1
    key_env: HOSTED_QWEN_API_KEY
  - provider: custom
    model: local-free-model
    base_url: http://127.0.0.1:20128/v1
    key_env: OMNIROUTE_API_KEY`}</code>
      </pre>

      <p>
        Prefer <code>hermes fallback add</code> over hand-editing <code>~/.hermes/config.yaml</code>. The YAML above is
        useful for review and managed configuration — not as a place to paste secrets.
      </p>

      <p>Put secret values in the protected environment file:</p>

      <pre className="blog-code">
        <code>chmod 600 ~/.hermes/.env</code>
      </pre>

      <aside className="blog-callout blog-callout-note">
        <p>
          <code>key_env</code> is the name of an environment variable. It is not the secret itself.
        </p>
      </aside>

      <h3>4. Verify the chain</h3>

      <pre className="blog-code">
        <code>{`hermes fallback list
hermes config check
hermes doctor`}</code>
      </pre>

      <p>
        A healthy listing shows one primary followed by numbered fallback entries. Check that every entry has:
      </p>
      <ul className="blog-list">
        <li>a provider</li>
        <li>an exact model ID</li>
        <li>the correct base URL for custom endpoints</li>
        <li>credentials available through the provider auth store or a named environment variable</li>
      </ul>

      <p>
        Start a new CLI session, or use <code>/new</code> on the gateway, before testing — so you are not relying on
        state loaded before the configuration changed.
      </p>

      <h3>5. Know what triggers failover</h3>
      <p>
        Hermes documents these primary-model triggers:
        <Ref n={1} />
      </p>

      <div className="blog-table-wrap">
        <table className="blog-table">
          <thead>
            <tr>
              <th>Condition</th>
              <th>Behaviour</th>
            </tr>
          </thead>
          <tbody>
            {triggers.map((row) => (
              <tr key={row.condition}>
                <td>
                  <code>{row.condition}</code>
                </td>
                <td>{row.behaviour}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p>
        When fallback activates, Hermes resolves the backup credentials, builds the appropriate client, swaps the
        provider and model, resets the retry counter, and continues with the existing conversation and tool history.
        <Ref n={1} />
      </p>

      <aside className="blog-callout blog-callout-principle">
        <span className="blog-callout-label">Fallback is turn-scoped</span>
        <p>
          A later user message normally starts with the primary again. This avoids permanently abandoning a provider
          after a single transient incident.
          <Ref n={1} />
        </p>
      </aside>

      <h2 id="designing-the-chain">Designing the chain</h2>

      <h3>6. Test the failure domains, not just the models</h3>
      <p>A useful chain should differ across at least two of the following:</p>
      <ul className="blog-list">
        {failureDomainAxes.map((axis) => <li key={axis}>{axis}</li>)}
      </ul>

      <p>Bad chain — both entries die when the router dies:</p>
      <pre className="blog-code blog-code-bad">
        <code>{`Primary:  router.example/v1 -> model A
Fallback: router.example/v1 -> auto`}</code>
      </pre>

      <p>Better chain — three independent failure domains:</p>
      <pre className="blog-code blog-code-good">
        <code>{`Primary:  Codex OAuth
Fallback: independently hosted Qwen endpoint
Fallback: local OmniRoute route`}</code>
      </pre>

      <p>
        Pin exact model IDs. <code>auto</code> behind the same broken endpoint is not a fallback.
      </p>

      <h3>7. Validate tool use</h3>
      <p>
        A plain &ldquo;hello&rdquo; only proves that text generation works. Run a harmless tool-use probe against each
        candidate before trusting it as an agent fallback:
      </p>

      <pre className="blog-code">
        <code>{`Use a read-only tool to report the current working directory,
then summarize the result in one sentence.`}</code>
      </pre>

      <p>
        The fallback model must support the API shape, tool calls, context size, and structured outputs your workflows
        require. A cheap chat model that cannot call tools is not a useful fallback for an operational agent.
      </p>

      <h3>8. Watch the hidden cost</h3>
      <p>
        Provider switches reset or miss model-specific prompt caches. A long conversation may be re-read at full
        input-token price on the first fallback request, and again when traffic returns to the primary.
        <Ref n={1} />
      </p>
      <p>
        That cost is usually better than downtime, but it matters for long-running agents. Keep the fallback capable,
        independent, and affordable enough to absorb a full-context request.
      </p>

      <h3>9. Manage or remove entries</h3>

      <pre className="blog-code">
        <code>{`hermes fallback list
hermes fallback remove
hermes fallback clear`}</code>
      </pre>

      <p>
        <code>remove</code> lets you choose a single entry. <code>clear</code> removes the entire chain after
        confirmation.
      </p>

      <h2 id="cli-pitfall">A CLI pitfall worth knowing</h2>

      <aside className="blog-callout blog-callout-warning">
        <span className="blog-callout-label">Do not build the list this way</span>
        <pre className="blog-code">
          <code>{`# Invalid for constructing the fallback list
hermes config set fallback_providers.0.provider custom`}</code>
        </pre>
        <p>
          In Hermes v0.20.0 that dotted path creates a YAML mapping keyed by <code>&quot;0&quot;</code>, not a YAML
          list. <code>hermes fallback list</code> silently ignores the result. This was verified in a disposable Hermes
          home before publication.
        </p>
      </aside>

      <p>
        Use <code>hermes fallback add</code>. If configuration automation must write the YAML directly, use a structured
        YAML or configuration library that emits a real list — then require <code>hermes fallback list</code> to
        recognise every entry as the acceptance test.
      </p>

      <h2 id="deployment-checklist">Deployment checklist</h2>
      <ul className="blog-checklist">
        {checklist.map((item) => (
          <li key={item}>
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
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <h2 id="sources">Sources</h2>
      <ol className="blog-sources">
        {sources.map((source, index) => (
          <li key={source.href} id={`source-${index + 1}`}>
            <a href={source.href} target="_blank" rel="noopener noreferrer">
              {source.title}
            </a>
          </li>
        ))}
      </ol>
    </>
  );
}
