import type { Lead } from "./types.js";

/** Lifecycle status stored alongside each lead. */
export const STATUS = {
  NEW: "new",
  NOTIFIED: "notified", // digest delivered to Telegram
  OUTREACH_SENT: "outreach_sent",
  REJECTED: "rejected",
} as const;

export type Status = (typeof STATUS)[keyof typeof STATUS];

/**
 * State shape of the LeadRegistry Virtual Object, keyed by the lead
 * fingerprint (lowercased domain).
 */
export type RegistryState = {
  lead: Lead;
  status?: Status;
  reason?: string;
  firstSeenAt: string;
  lastTouchAt: string;
  /** Drafted but unsent outreach (awaits human approval). */
  draft?: string;
};

export type { Lead };
