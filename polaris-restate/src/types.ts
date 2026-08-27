export type Offering = "agents" | "qubo" | "both";

/** A candidate surfaced by any discovery source, before scoring. */
export type Candidate = {
  title: string;
  url: string;
  snippet: string;
};

/** A candidate that Hermes has scored against the Yabloko Labs ICP. */
export type Lead = {
  /** Lowercased domain — the dedup fingerprint shared across all services. */
  fingerprint: string;
  company: string;
  url: string;
  offering: Offering;
  fitScore: number; // 0..100
  summary: string;
};

export function domainOf(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

const EMAILISH =
  /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

/** Leads we should never process: job boards' own domains, majors, our own site. */
export function isBlacklisted(domain: string): boolean {
  if (!domain || domain.includes("yablokolabs")) return true;
  if (EMAILISH.test(domain)) return true;
  const blocked = [
    "github.com", "reddit.com", "news.ycombinator.com", "medium.com",
    "linkedin.com", "twitter.com", "x.com", "youtube.com",
    "google.com", "microsoft.com", "ibm.com", "amazon.com", "aws.amazon.com",
    "deshaw.com",
  ];
  return blocked.some((b) => domain === b || domain.endsWith(`.${b}`));
}
