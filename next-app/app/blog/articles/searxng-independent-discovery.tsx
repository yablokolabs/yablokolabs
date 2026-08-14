const checklist = [
  "Instance responds independently",
  "JSON output enabled",
  "Multiple useful engines configured",
  "Aggregate results verified against direct query",
  "Results treated as candidates, not facts",
  "Claims validated at source pages",
  "Prices / inventory validated independently",
  "Secrets stay outside version control",
  "Timeouts and upstream failures handled",
  "Rate limits understood",
  "Search and browser/retrieval responsibilities separate",
];

export default function SearxngIndependentDiscovery() {
  return (
    <>
      <p className="blog-lead">
        <strong>Giving an AI agent web access does not automatically give it an independent view of the web.</strong>
      </p>
      <p>
        If every search request goes through one provider, the agent inherits that provider&apos;s ranking decisions,
        indexing coverage, filtering policies, geographic availability, rate limits, outages, and commercial
        incentives. For serious autonomous discovery, that is an architectural dependency worth addressing explicitly.
      </p>

      <h2 id="why-meta-search-matters">Why independent meta‑search matters</h2>
      <p>
        The pattern is straightforward: put an independent meta‑search layer between the agent and individual search
        engines. Rather than maintaining a complete web index itself, the meta‑search engine aggregates responses
        from multiple upstream sources and returns one combined result set.
      </p>

      <pre className="blog-code">
        <code>{`AI Agent
    |
    v
SearXNG (independent meta-search layer)
    |
    +---- Search Engine A
    +---- Search Engine B
    +---- Search Engine C
    +---- Search Engine D
    |
    v
Aggregated Candidate Results`}</code>
      </pre>

      <p>
        The critical distinction: <strong>SearXNG is a discovery layer, not a truth layer.</strong> Returned results
        are candidates to investigate — not verified facts. A robust agent subsequently retrieves the underlying page
        and validates claims independently before acting.
      </p>

      <h2 id="core-principle">The core principle</h2>
      <aside className="blog-callout blog-callout-principle">
        <p>
          <strong>“Search should discover candidates. Verification should establish truth.”</strong>
        </p>
        <p>
          A search snippet saying <code>Product X — ₹4,999 — In Stock</code> does not prove the product is actually
          available at that price or deliverable. The agent should retrieve the underlying source, confirm the
          variant, price, stock state, delivery destination, and seller — only then present the result as reliable.
        </p>
      </aside>

      <h2 id="why-meta-search-not-another-api">Why meta‑search instead of just another search API?</h2>
      <p>
        A second vendor search API improves redundancy, but redundancy and independence are not the same thing. If
        both APIs use similar ranking systems and the same upstream sources, the agent remains coupled to one
        discovery model. Meta‑search surfaces different discovery surfaces by design — which means disagreement
        between results is useful evidence, not noise.
      </p>

      <h2 id="setup">Setup (step-by-step)</h2>

      <h3>1. Verify installation path</h3>
      <pre className="blog-code">
        <code>{`which searxng || echo "not in PATH — check ~/searxng-config/ or Docker"
docker pull searxng/searxng:latest`}</code>
      </pre>

      <h3>2. Create configuration</h3>
      <pre className="blog-code">
        <code>{`mkdir -p ~/searxng-config
cat > ~/searxng-config/settings.yml << 'YAML'
search:
  formats: ["html", "json"]
  default_lang: "en"
  query_parts: ["q"]
  languages: ["en", "hi", "te"]
YAML`}</code>
      </pre>

      <h3>3. Keep environment separate (.env)</h3>
      <pre className="blog-code">
        <code>{`.env location: ~/searxng-config/.env
Reference: SEARXNG_URL, SEARXNG_PORT
chmod 600 ~/searxng-config/.env
Keep secrets out of version-controlled files.`}</code>
      </pre>

      <h2 id="config-pitfall">A config pitfall worth knowing</h2>

      <aside className="blog-callout blog-callout-warning">
        <span className="blog-callout-label">Do not expect JSON to work without enabling it</span>
        <pre className="blog-code">
          <code>{`search:
  formats:
    - html`}</code>
        </pre>
        <p>
          With only <code>html</code> listed, <code>/search?q=…&format=json</code> returns{" "}
          <code>403 Forbidden</code> with an HTML error page — the JSON API silently stays off. Add{" "}
          <code>json</code> to <code>search.formats</code> and the same request returns real JSON. This was verified
          against a disposable Docker instance of <code>searxng/searxng:latest</code> before publication.
        </p>
      </aside>

      <p>
        Use the JSON probe as the acceptance test: if <code>?format=json</code> does not return JSON, the agent is
        going to hit a dead end the moment it asks for machine-readable results.
      </p>

      <h2 id="independent-verification">Independent verification</h2>
      <p>Before wiring any agent, verify independently:</p>
      <ul className="blog-list">
        <li>The instance responds on its own (not as a thin proxy to one engine).</li>
        <li>JSON search output works and aggregate results vary from direct engine queries.</li>
        <li>Returned URLs are usable candidates — snippets alone do not establish truth.</li>
        <li>
          The architecture separates discovery (SearXNG), retrieval (browser/HTTP), and verification (agent
          reasoning).
        </li>
      </ul>

      <h2 id="operational-reality">Operational reality</h2>
      <p>
        Meta‑search reduces dependence on any single ranking system. It does not eliminate ranking bias altogether —
        upstream crawlers, regional differences, and filtering policies still shape results. That distinction matters
        for agents expected to perform serious, verifiable research.
      </p>
      <p>
        Meta‑search does not replace browser automation either. A meta‑search layer answers <em>“where might the
        information be?”</em>; a browser layer answers <em>“what does this page actually contain right now?”</em> The
        two are complementary.
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
    </>
  );
}
