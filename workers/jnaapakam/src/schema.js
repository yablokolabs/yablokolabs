// Validation + normalization for POST /v1/personas.
// Inputs are permissive (strings, arrays, objects); outputs are normalized to a
// fixed-shape persona with a stable key order so the sha256 content address is
// deterministic for identical personas.

export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const LIMITS = {
  name: 200,
  emoji: 64,
  description: 2000,
  section: 20000, // any soul/memory section body
};

function trimStr(v) {
  return typeof v === "string" ? v.trim() : "";
}

// Accepts a string, an array of strings, or a small object/string -> string.
// Arrays become bullet lists; objects are flattened to "key: value" lines.
function normSection(v, limit = LIMITS.section) {
  if (v == null) return undefined;
  let out;
  if (Array.isArray(v)) {
    const items = v
      .map((x) => (typeof x === "object" && x !== null ? flatObject(x) : trimStr(x)))
      .filter(Boolean);
    out = items.length ? items : undefined;
  } else if (typeof v === "object") {
    const flat = flatObject(v);
    out = flat || undefined;
  } else {
    out = trimStr(v) || undefined;
  }
  if (out !== undefined && String(out).length > limit) {
    throw new ApiError(400, `section too long (max ${limit} chars)`);
  }
  return out;
}

function flatObject(obj) {
  const lines = [];
  for (const [k, val] of Object.entries(obj)) {
    if (val == null) continue;
    const s = Array.isArray(val) ? val.map((x) => String(x)).join(", ") : String(val);
    if (s.trim()) lines.push(`${k}: ${s.trim()}`);
  }
  return lines.join("\n");
}

const MEMORY_SECTIONS = [
  ["user", "user"],
  ["projects", "projects"],
  ["preferences", "preferences"],
  ["lessons", "lessons"],
  ["lessons_learned", "lessons"],
  ["lessonsLearned", "lessons"],
];

function normMemory(m) {
  if (m == null) return undefined;
  if (typeof m === "string") {
    // Flat string -> treat as user context.
    const s = trimStr(m);
    return s ? { user: s } : undefined;
  }
  if (typeof m !== "object" || Array.isArray(m)) return undefined;
  const out = {};
  for (const [key, dest] of MEMORY_SECTIONS) {
    const v = normSection(m[key]);
    if (v) out[dest] = v;
  }
  return Object.keys(out).length ? out : undefined;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

// Whitelist + normalize. Throws ApiError(400) with a helpful message.
export function validateAndNormalize(input) {
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    throw new ApiError(400, "body must be a JSON object");
  }
  const name = trimStr(input.name);
  if (!name) throw new ApiError(400, "'name' is required (string)");
  if (name.length > LIMITS.name) {
    throw new ApiError(400, `'name' too long (max ${LIMITS.name} chars)`);
  }
  const emoji = trimStr(input.emoji);
  if (emoji.length > LIMITS.emoji) {
    throw new ApiError(400, `'emoji' too long (max ${LIMITS.emoji} chars)`);
  }
  const description = trimStr(input.description);
  if (description.length > LIMITS.description) {
    throw new ApiError(400, `'description' too long (max ${LIMITS.description} chars)`);
  }
  const created = trimStr(input.created) || todayIso();

  // Canonical key order (also what /v1/schema advertises).
  return {
    name,
    ...(emoji ? { emoji } : {}),
    ...(description ? { description } : {}),
    created,
    ...(normSection(input.personality) !== undefined
      ? { personality: normSection(input.personality) }
      : {}),
    ...(normSection(input.boundaries) !== undefined
      ? { boundaries: normSection(input.boundaries) }
      : {}),
    ...(normSection(input.preferences) !== undefined
      ? { preferences: normSection(input.preferences) }
      : {}),
    ...(normMemory(input.memory) ? { memory: normMemory(input.memory) } : {}),
  };
}

// JSON Schema advertised at GET /v1/schema so agents can self-discover the
// POST /v1/personas body without reading prose.
export const PERSONA_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://jnaapakam.yablokolabs.com/v1/schema",
  title: "jnaapakam persona",
  description:
    "Structured persona for the jnaapakam memory protocol. POST to /v1/personas; " +
    "the service returns SOUL.md / IDENTITY.md / MEMORY.md plus a jnaapakam.yml manifest.",
  type: "object",
  additionalProperties: false,
  required: ["name"],
  properties: {
    name: {
      type: "string",
      maxLength: 200,
      description: "The agent's name.",
    },
    emoji: {
      type: "string",
      maxLength: 64,
      description: "Signature emoji, e.g. 🦇.",
    },
    description: {
      type: "string",
      maxLength: 2000,
      description: "One-line description of the agent.",
    },
    created: {
      type: "string",
      description: "ISO date (YYYY-MM-DD). Defaults to today.",
    },
    personality: {
      oneOf: [{ type: "string" }, { type: "array", items: { type: "string" } }],
      description: "How the agent communicates (SOUL.md -> Core Personality).",
    },
    boundaries: {
      oneOf: [{ type: "string" }, { type: "array", items: { type: "string" } }],
      description: "What the agent must never do (SOUL.md -> Boundaries).",
    },
    preferences: {
      oneOf: [
        { type: "string" },
        { type: "array", items: { type: "string" } },
        { type: "object" },
      ],
      description: "Communication style preferences (SOUL.md -> Preferences).",
    },
    memory: {
      oneOf: [
        { type: "string" },
        {
          type: "object",
          additionalProperties: false,
          properties: {
            user: { oneOf: [{ type: "string" }, { type: "array", items: { type: "string" } }] },
            projects: { oneOf: [{ type: "string" }, { type: "array", items: { type: "string" } }] },
            preferences: {
              oneOf: [{ type: "string" }, { type: "array", items: { type: "string" } }],
            },
            lessons: {
              oneOf: [{ type: "string" }, { type: "array", items: { type: "string" } }],
            },
          },
        },
      ],
      description: "Curated long-term memory (MEMORY.md sections).",
    },
  },
  examples: [
    {
      name: "Buffy",
      emoji: "🦇",
      description: "A cheerful coding agent that ships small diffs.",
      personality: "Concise, direct, occasionally punny.",
      boundaries: ["Never run git push without asking.", "Never invent test results."],
      preferences: "Short answers, code first, prose after.",
      memory: {
        user: "Works on yablokolabs open-source projects.",
        lessons: ["Check the repo conventions before editing."],
      },
    },
  ],
};
