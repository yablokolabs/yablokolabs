// Analytics for the jnaapakam persona API.
//
// Events are written to D1 (binding ANALYTICS) from the request handler; the
// worker must never fail because analytics failed, so every write is wrapped
// in a no-op catch. /v1/stats reads back totals, unique visitors (hashed IPs),
// a UA breakdown, and daily activity.

const ACTION = {
  PERSONA_CREATED: "persona_created",
  FILE_DOWNLOAD: "file_download",
  ZIP_DOWNLOAD: "zip_download",
  SCHEMA_VIEW: "schema_view",
  INFO_VIEW: "info_view",
  STATS_VIEW: "stats_view",
  META_VIEW: "meta_view",
};

// Heuristic UA bucketing so stats can answer "how many agents vs tools vs
// browsers". Order matters: browser-y strings often also contain "bot" etc.
export function classifyUa(ua) {
  if (!ua) return "unknown";
  const u = ua.toLowerCase();
  if (/mozilla|chrome|safari|firefox|edg\/|opera|msie/.test(u) && !/headless|phantom/.test(u)) {
    return "browser";
  }
  if (/agent|assistant|gpt|claude|gemini|llm|openai|anthropic|deepseek|moltbook|bot|crawler|spider/.test(u)) {
    return "agent";
  }
  if (/curl|wget|python|requests|node|go-http|axios|undici|httpx|java|okhttp|ruby/.test(u)) {
    return "tool";
  }
  return "unknown";
}

async function sha256Hex(str) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Privacy-preserving visitor id: hash of the client IP rotated daily, so a
// visitor is linkable within a day but not tracked long-term by IP.
async function ipHash(ip) {
  if (!ip) return null;
  const day = new Date().toISOString().slice(0, 10);
  const hex = await sha256Hex(`jnaapakam:${ip}:${day}`);
  return hex.slice(0, 16);
}

// StatsService wraps a D1 binding (env.ANALYTICS). If constructed without one
// (local dev / tests), record() no-ops and stats() returns a zeroed report.
export class StatsService {
  constructor(db) {
    this.db = db;
  }

  async record({ action, path, ua, ip, personaId = null }) {
    if (!this.db) return;
    try {
      const uaCategory = classifyUa(ua);
      const hash = await ipHash(ip);
      await this.db
        .prepare(
          `INSERT INTO events (ts, action, path, ua, ua_category, ip_hash, persona_id)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(new Date().toISOString(), action, path, ua ?? null, uaCategory, hash, personaId)
        .run();
    } catch {
      // Analytics must never break the API.
    }
  }

  // Count distinct ip_hashes in a window (approximates unique visitors/agents).
  async _uniqueHashes(sinceIso) {
    if (!this.db) return 0;
    try {
      const res = await this.db
        .prepare("SELECT COUNT(DISTINCT ip_hash) AS n FROM events WHERE ts >= ?1 AND ip_hash IS NOT NULL")
        .bind(sinceIso)
        .first();
      return res?.n ?? 0;
    } catch {
      return 0;
    }
  }

  async stats() {
    if (!this.db) {
      return { enabled: false };
    }
    try {
      const totals = await this.db
        .prepare(
          `SELECT
             COUNT(*) AS events,
             SUM(CASE WHEN action = 'persona_created' THEN 1 ELSE 0 END) AS personas_minted,
             SUM(CASE WHEN action IN ('file_download','zip_download') THEN 1 ELSE 0 END) AS downloads
           FROM events`,
        )
        .first();
      const now = new Date();
      const day = (d) => new Date(d - 24 * 3600 * 1000).toISOString();
      const uniq24h = await this._uniqueHashes(day(now));
      const uniq7d = await this._uniqueHashes(day(now - 6 * 24 * 3600 * 1000));

      const uaRows = await this.db
        .prepare("SELECT ua_category, COUNT(*) AS n FROM events GROUP BY ua_category")
        .all();
      const uaBreakdown = Object.fromEntries(
        (uaRows?.results ?? []).map((r) => [r.ua_category, r.n]),
      );

      // Last 14 days, zero-filled.
      const byDayRows = await this.db
        .prepare(
          `SELECT substr(ts, 1, 10) AS date,
                  SUM(CASE WHEN action = 'persona_created' THEN 1 ELSE 0 END) AS created,
                  SUM(CASE WHEN action IN ('file_download','zip_download') THEN 1 ELSE 0 END) AS downloads,
                  COUNT(*) AS events
           FROM events
           WHERE ts >= ?1
           GROUP BY date ORDER BY date`,
        )
        .bind(new Date(now - 13 * 24 * 3600 * 1000).toISOString())
        .all();
      const byDayMap = new Map(
        (byDayRows?.results ?? []).map((r) => [r.date, { created: r.created ?? 0, downloads: r.downloads ?? 0, events: r.events ?? 0 }]),
      );
      const byDay = [];
      for (let i = 13; i >= 0; i--) {
        const date = new Date(now - i * 24 * 3600 * 1000).toISOString().slice(0, 10);
        byDay.push({ date, ...(byDayMap.get(date) ?? { created: 0, downloads: 0, events: 0 }) });
      }

      const topRows = await this.db
        .prepare(
          `SELECT persona_id, COUNT(*) AS n FROM events
           WHERE persona_id IS NOT NULL AND action IN ('file_download','zip_download')
           GROUP BY persona_id ORDER BY n DESC LIMIT 5`,
        )
        .all();
      const topPersonas = (topRows?.results ?? []).map((r) => ({
        persona_id: r.persona_id,
        downloads: r.n,
      }));

      return {
        enabled: true,
        totals: {
          events: totals?.events ?? 0,
          personas_minted: totals?.personas_minted ?? 0,
          downloads: totals?.downloads ?? 0,
        },
        unique_visitors: { last_24h: uniq24h, last_7d: uniq7d },
        ua_breakdown: uaBreakdown,
        by_day: byDay,
        top_personas: topPersonas,
        note: "unique_visitors = distinct hashed client IPs per window; ua_breakdown is heuristic.",
      };
    } catch {
      return { enabled: true, error: "stats temporarily unavailable" };
    }
  }
}

export { ACTION };