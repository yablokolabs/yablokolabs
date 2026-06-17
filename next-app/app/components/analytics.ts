"use client";

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (command: string, eventName: string, params?: Record<string, unknown>) => void;
    plausible?: (eventName: string, options?: { props?: Record<string, unknown> }) => void;
    sa_event?: (eventName: string, params?: Record<string, unknown>) => void;
  }
}

export function trackSiteEvent(eventName: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent("yl:analytics", {
      detail: { eventName, params, ts: Date.now() },
    }),
  );

  window.dataLayer?.push({ event: eventName, ...params });
  window.gtag?.("event", eventName, params);
  window.plausible?.(eventName, { props: params });
  window.sa_event?.(eventName, params);

  if (process.env.NODE_ENV !== "production") {
    console.info("[yl-analytics]", eventName, params);
  }
}
