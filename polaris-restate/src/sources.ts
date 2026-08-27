import { config } from "./config.js";
import type { Candidate } from "./types.js";

/**
 * Discovery sources for the ICPs Yabloko Labs sells to:
 *  1. teams that want AI agents built,
 *  2. teams with optimization problems that fit our quantum-inspired QUBO layer.
 *
 * Every adapter is read-only and keyless (SearXNG is self-hosted), so a failed
 * source degrades gracefully instead of failing the whole run.
 */

type Icp = "agents" | "qubo";

const QUERIES: Record<Icp, string[]> = {
  agents: [
    "startup hiring \"AI agent\" automation pilot RFP",
    "company announcement customer support automation agent rollout",
    "\"looking for\" agency build AI agent chatbot assistant",
  ],
  qubo: [
    "logistics last-mile routing optimization pilot tender",
    "port container terminal berth scheduling optimization project",
    "retail workforce scheduling optimization vendor request",
  ],
};

/** Fetch JSON with a hard timeout so one slow source cannot stall a cycle. */
async function getJson<T>(url: string, timeoutMs = 15_000): Promise<T> {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(timeoutMs),
    headers: { accept: "application/json" },
  });
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status}`);
  return (await res.json()) as T;
}

/**
 * SearXNG adapter — our own independent meta-search layer with "json" enabled
 * in search.formats (403 without it; see the SearXNG post on the blog).
 */
async function searxng(query: string): Promise<Candidate[]> {
  const base = config.searxngBaseUrl();
  if (!base) return [];
  const url = `${base.replace(/\/$/, "")}/search?q=${encodeURIComponent(query)}&format=json&language=en`;
  type SearxResponse = { results?: { title?: string; url?: string; content?: string }[] };
  const data = await getJson<SearxResponse>(url);
  return (data.results ?? [])
    .filter((r): r is { title: string; url: string; content?: string } =>
      Boolean(r.title && r.url))
    .map((r) => ({ title: r.title, url: r.url, snippet: r.content ?? "" }));
}

/**
 * Keyless discovery fallback: Hacker News Algolia API. Signals are noisy but
 * real — launch posts and discussions naming vendors and problems.
 */
async function hackerNews(query: string): Promise<Candidate[]> {
  const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=10`;
  type HnResponse = { hits?: { title?: string | null; url?: string | null; story_text?: string | null }[] };
  const data = await getJson<HnResponse>(url);
  return (data.hits ?? [])
    .filter((h): h is { title: string; url: string; story_text?: string | null } =>
      Boolean(h.title && h.url))
    .map((h) => ({ title: h.title, url: h.url, snippet: h.story_text ?? "" }));
}

/** Collect candidates across all configured sources for one ICP. */
export async function discover(icp: Icp): Promise<Candidate[]> {
  const jobs = QUERIES[icp].flatMap((query) => [
    searxng(query).catch(() => []),
    hackerNews(query).catch(() => []),
  ]);

  const settled = await Promise.all(jobs);
  const seen = new Set<string>();
  const merged: Candidate[] = [];
  for (const list of settled) {
    for (const candidate of list) {
      if (seen.has(candidate.url)) continue;
      seen.add(candidate.url);
      merged.push(candidate);
    }
  }
  return merged;
}
