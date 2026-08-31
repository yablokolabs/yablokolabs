// Plain data only — no JSX. The sitemap generator imports this at build time so
// that a new post reaches the sitemap without a script edit.

export type BlogPost = {
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  /** ISO date. Used for both the visible byline and structured data. */
  date: string;
  readTime: string;
  category: string;
  tags: string[];
  author: string;
  /** Optional provenance line shown under the article header. */
  testedAgainst?: string;
  /** Optional FAQ entries rendered at the end of the article and exposed as FAQPage schema. */
  faq?: { question: string; answer: string }[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "hermes-restate-durable-tasks",
    title: "Durable Agent Tasks: Making Hermes More Powerful with Restate",
    subtitle:
      "A request-scoped agent dies when its process does. Wrap Hermes-driven workflows in durable execution and they survive crashes, waits, approvals, and schedules.",
    excerpt:
      "A request-scoped agent dies when its process does. Journaling every step makes LLM calls, MCP tool runs, and human-approval waits resumable.",
    date: "2026-08-27",
    readTime: "10 min read",
    category: "Reliability Engineering",
    tags: [
      "AI Agents",
      "Hermes Agent",
      "Restate",
      "Durable Execution",
      "MCP",
    ],
    author: "Yabloko Labs Ltd",
    testedAgainst:
      "Hermes Agent v0.20.0 · Restate 1.x server & TypeScript SDK 1.16.9 · August 2026",
    faq: [
      {
        question: "What does Restate actually add to a Hermes agent?",
        answer:
          "Durability around the agent loop. Every LLM call and tool execution becomes a journaled step, so a crashed task resumes exactly where it stopped instead of restarting from zero — plus durable timers, suspending waits, and a step-by-step execution trace in the Restate UI.",
      },
      {
        question: "Do I have to rewrite my agent logic or change model providers?",
        answer:
          'No. The handler still contains an ordinary agent loop, and Hermes keeps its configured primary and fallback providers. You wrap side-effecting calls in ctx.run() and expose one Restate service handler; the rest of the logic is unchanged.',
      },
      {
        question: "How does waiting for days for a human approval cost nothing?",
        answer:
          "When the only pending thing is an external event, Restate suspends the invocation instead of holding it in memory. On resume, the journaled steps replay instantly. It works like await, not like polling.",
      },
      {
        question: "Is durable execution only about crash recovery?",
        answer:
          "No — recovery is just the headline. Scheduled check-ins (ctx.sleep), human-in-the-loop gates (signals and awakeables that you resolve over HTTP when ready), exactly-once tool effects, and per-invocation observability all come from the same journal.",
      },
    ],
  },
  {
    slug: "searxng-independent-discovery",
    title: "SearXNG: Independent Meta‑Search for Agent‑Ready Discovery",
    subtitle:
      "Giving AI agents a broader, independently aggregated view of the web — without permanently binding discovery to a single provider.",
    excerpt:
      "Meta‑search cuts dependence on any single ranking engine. Setup, independent verification, and an architecture separating discovery, retrieval, and reasoning.",
    date: "2026-08-14",
    readTime: "4 min read",
    category: "Discovery Engineering",
    tags: ["AI Agents", "Meta‑Search", "SearXNG", "Agent Discovery", "Verification"],
    author: "Yabloko Labs Ltd",
    testedAgainst: "Self-hosted SearXNG · August 2026",
    faq: [
      {
        question: "What is SearXNG?",
        answer:
          "SearXNG is a self-hostable, privacy-respecting meta-search engine that aggregates results from many upstream search engines into one result set, without maintaining its own web index.",
      },
      {
        question: "Why use meta-search for AI agents instead of a single search API?",
        answer:
          "A second vendor API improves redundancy, not independence — both may share ranking systems and upstream sources. Meta-search surfaces different discovery surfaces by design, so disagreement between results is useful evidence, not noise.",
      },
      {
        question: "How do I enable JSON output in SearXNG?",
        answer:
          'Add "json" to search.formats in settings.yml (for example formats: ["html", "json"]). With only "html" listed, /search?q=…&format=json returns 403 Forbidden with an HTML error page.',
      },
      {
        question: "Does SearXNG replace browser automation or verification?",
        answer:
          "No. A meta-search layer answers 'where might the information be'; a browser layer answers 'what does this page actually contain right now'. Search results are candidates to investigate, not verified facts.",
      },
    ],
  },
  {
    slug: "hermes-provider-fallbacks",
    title: "Hermes Provider Fallbacks",
    subtitle:
      "Designing a failover chain that actually survives a provider outage — a practical guide for teams running production AI agents.",
    excerpt:
      "One failed LLM provider shouldn't take your AI agent offline. Here's how to build a fallback chain with genuinely different failure domains.",
    date: "2026-08-11",
    readTime: "9 min read",
    category: "Reliability Engineering",
    tags: [
      "AI Agents",
      "Hermes Agent",
      "Reliability",
      "Failover",
      "LLM Operations",
    ],
    author: "Yabloko Labs Ltd",
    testedAgainst: "Hermes Agent v0.20.0 (build 2026.8.3)",
    faq: [
      {
        question: "What happens when a Hermes provider fails?",
        answer:
          "When the primary provider hits a rate limit, server error, authentication failure, connection problem, or repeated invalid response, Hermes automatically fails over to the next provider:model in the fallback_providers chain while preserving conversation and tool context.",
      },
      {
        question: "How do I add fallback providers in Hermes?",
        answer:
          "Run hermes fallback add once per backup in the order they should be tried, then verify with hermes fallback list. The command reuses the provider/model picker and preserves the current primary model.",
      },
      {
        question: "How many fallbacks should an AI agent have?",
        answer:
          "Enough to cover genuinely different failure domains — provider account, endpoint, region, authentication path, model family, and local versus hosted infrastructure. A second model behind the same overloaded router is not a real fallback.",
      },
      {
        question: "Do fallback models need tool support?",
        answer:
          "Yes. A fallback for an operational agent must pass a tool-call probe, not just a text completion — it must support the API shape, tool calls, context size, and structured outputs your workflows require.",
      },
      {
        question: "What triggers Hermes failover?",
        answer:
          "HTTP 429 and 500/502/503 after retries are exhausted, HTTP 401/403/404 immediately, connection failures, and malformed or empty responses after repeated occurrences.",
      },
    ],
  },
  {
    slug: "docker-compose-egress-legacy-iptables",
    title: "Docker Compose Egress and the Stale Legacy iptables Ruleset",
    subtitle:
      "Your Compose stack is healthy, your host reaches the internet, and your containers have none. A second firewall ruleset was dropping everything before NAT — here is how to find it.",
    excerpt:
      "Docker's nftables rules looked perfect while a stale iptables-legacy ruleset silently dropped the compose network's outbound traffic. Counters, the two-ruleset trap, and the three-command fix.",
    date: "2026-08-31",
    readTime: "6 min read",
    category: "Reliability Engineering",
    tags: ["Docker", "Docker Compose", "Networking", "iptables", "Reliability"],
    author: "Yabloko Labs Ltd",
    testedAgainst: "Docker 29.7.2 · Debian trixie · iptables-legacy vs nftables · August 2026",
    faq: [
      {
        question: "Why would Docker Compose containers lose internet when the host still has it?",
        answer:
          "A second, stale iptables-legacy ruleset can coexist with Docker's nftables rules. If its FORWARD chain has policy DROP and only accepts the default docker0 bridge, traffic from the compose bridge is accepted by one ruleset and dropped by the other before it ever reaches NAT.",
      },
      {
        question: "How do I tell if my container egress is being dropped before NAT?",
        answer:
          "Check the NAT counters. If the MASQUERADE rule for your compose subnet counts zero packets while the FORWARD counters are ticking, traffic is being dropped between FORWARD and POSTROUTING — look for a second ruleset with iptables-legacy -L FORWARD -n -v.",
      },
      {
        question: "Is the fix permanent?",
        answer:
          "No. iptables-legacy rules are runtime-only and disappear on reboot. Persist them in a script or systemd unit, or the hang will return on a fresh boot.",
      },
    ],
  },
  {
    slug: "silently-healthy-agent-infrastructure",
    title: "Silently Healthy: When Agent Infrastructure Reports Health and Does Nothing",
    subtitle:
      "A bot that logs 'listening' while unauthenticated. A token rejected with a swallowed 404. A network that looks fine from the host. Three failures, one class: components that look healthy while doing nothing.",
    excerpt:
      "Up and working are different claims. Three production failures where the process was healthy, the logs were clean, and nothing was happening — and the one habit that catches all of them.",
    date: "2026-08-31",
    readTime: "7 min read",
    category: "Reliability Engineering",
    tags: ["AI Agents", "Telegram", "Docker", "Monitoring", "Reliability"],
    author: "Yabloko Labs Ltd",
    testedAgainst: "C2C Telegram bot · Docker Compose · Claude CLI 2.1.251 · August 2026",
    faq: [
      {
        question: "Why does getUpdates swallow a 404 from a bad bot token?",
        answer:
          "getUpdates parses the response and returns an empty update list when ok is false, so a malformed token makes the bot poll happily while receiving nothing — with clean logs. getMe, which asks Telegram to identify the token, is the check that exposes it.",
      },
      {
        question: "What is the difference between 'up' and 'working'?",
        answer:
          "Up means the process started and its own health signals look fine. Working means the delivery path — token, network, model, approvals — is functioning end to end. The first is reported by the component; only the second is verified by asking the remote end.",
      },
      {
        question: "What three checks catch these silent failures before a demo?",
        answer:
          "getMe to prove the token, a curl from inside the container to prove egress, and a one-line model PONG probe to prove the model is reachable from where the code runs.",
      },
    ],
  },
].sort((a, b) => b.date.localeCompare(a.date));

export const getPostBySlug = (slug: string): BlogPost | undefined =>
  blogPosts.find((post) => post.slug === slug);

export const formatPostDate = (isoDate: string): string => {
  // Fixed locale and timezone so server and client render identical text.
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
};
