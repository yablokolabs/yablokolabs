import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config = {
  // Telegram delivery of digests and drafts.
  telegramBotToken: () => required("TELEGRAM_BOT_TOKEN"),
  telegramChatId: () => required("TELEGRAM_CHAT_ID"),

  // Hermes CLI, invoked headlessly. Must respond to: hermes chat -q "<prompt>"
  hermesBin: () => process.env["HERMES_BIN"] ?? "hermes",
  hermesTimeoutMs: () => Number(process.env["HERMES_TIMEOUT_MS"] ?? 300_000),

  // Optional: self-hosted SearXNG with JSON format enabled (see the
  // SearXNG post on yablokolabs.com/blog). Other sources need no key.
  searxngBaseUrl: () => process.env["SEARXNG_BASE_URL"] ?? null,

  // Where this deployment serves Restate handlers.
  port: () => Number(process.env["PORT"] ?? 9080),
} as const;
