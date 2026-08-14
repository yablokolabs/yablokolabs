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
};

export const blogPosts: BlogPost[] = [
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
