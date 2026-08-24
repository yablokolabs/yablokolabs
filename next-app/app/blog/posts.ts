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
    slug: "searxng-independent-discovery",
    title: "SearXNG: Independent Meta‑Search for Agent‑Ready Discovery",
    subtitle:
      "Giving AI agents a broader, independently aggregated view of the web — without permanently binding discovery to a single provider.",
    excerpt:
      "Meta‑search reduces dependence on any single ranking system; verification establishes truth separately. Setup, independent verification, and the architecture that separates discovery, retrieval, and reasoning.",
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
      "One failed LLM provider should not take your AI agent offline. Yet the most common failover setup — a second model behind the same router — fails at exactly the moment it is needed. What a fallback chain with genuinely different failure domains looks like, and how to build one.",
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
