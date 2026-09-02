-- Analytics events for the jnaapakam persona API.
-- One row per meaningful request (mint, download, schema/info view).
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ts TEXT NOT NULL,            -- ISO 8601 UTC (e.g. 2026-09-02T19:00:00.000Z)
  action TEXT NOT NULL,        -- persona_created | file_download | zip_download | schema_view | info_view | stats_view | meta_view
  path TEXT NOT NULL,
  ua TEXT,                     -- raw User-Agent (may be null for some agents)
  ua_category TEXT,            -- agent | browser | tool | unknown (heuristic, see analytics.js)
  ip_hash TEXT,                -- sha256(CF-Connecting-IP + day), 16 hex chars; no raw IPs stored
  persona_id TEXT              -- content address for persona-related actions
);

CREATE INDEX IF NOT EXISTS idx_events_ts ON events(ts);
CREATE INDEX IF NOT EXISTS idx_events_action ON events(action);
CREATE INDEX IF NOT EXISTS idx_events_persona ON events(persona_id);