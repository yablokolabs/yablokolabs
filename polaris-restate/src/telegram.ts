import { config } from "./config.js";
import type { Lead } from "./types.js";

async function tg(method: string, body: Record<string, unknown>): Promise<void> {
  const res = await fetch(`https://api.telegram.org/bot${config.telegramBotToken()}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Telegram ${method} failed: ${res.status} ${await res.text()}`);
  }
}

/** Escape minimal HTML so Telegram parse_mode=HTML never rejects a digest. */
function esc(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function sendMessage(text: string): Promise<void> {
  await tg("sendMessage", {
    chat_id: config.telegramChatId(),
    text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
  });
}

export async function sendLeadDigest(lead: Lead & { reason?: string }): Promise<string> {
  const label =
    lead.offering === "qubo"
      ? "QUBO / quantum-inspired optimization"
      : lead.offering === "agents"
        ? "AI agent build"
        : "AI agents + QUBO";
  const lines = [
    `🎯 <b>New qualified lead</b> (<code>${esc(lead.fingerprint)}</code>)`,
    `Company: <b>${esc(lead.company)}</b>`,
    `Fit for: ${label} · score <b>${lead.fitScore}/100</b>`,
    `Source: ${esc(lead.url)}`,
    "",
    esc(lead.summary),
    lead.reason ? `\nWhy now: ${esc(lead.reason)}` : "",
    "",
    `<code>curl localhost:8080/Outreach/${encodeURIComponent(lead.fingerprint)}/run --json '${JSON.stringify(lead.url)}'</code>`,
  ];
  const text = lines.filter(Boolean).join("\n");
  await sendMessage(text);
  return text;
}
