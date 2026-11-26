"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { trackSiteEvent } from "./analytics";

// A quiet nudge, not a redirect. Auto-redirecting a visitor to a subdomain
// breaks the back button, loses the page they came for, and reads as an ad.
// This card waits for engagement, appears once, and stays dismissible.
const DISMISS_KEY = "yl:cohort-invite-dismissed";
const SEEN_KEY = "yl:cohort-invite-seen";
const HIDE_FOR_MS = 14 * 24 * 60 * 60 * 1000;
const FIRST_ATTEMPT_MS = 25_000;
const RETRY_MS = 8_000;

// Pages where a cohort nudge would be off-topic or duplicate the page itself.
const EXCLUDED = ["/cohort", "/careers", "/ai-agents"];

export default function CohortInvite() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (EXCLUDED.some((path) => pathname === path || pathname.startsWith(`${path}/`))) return;

    try {
      const dismissedAt = Number(window.localStorage.getItem(DISMISS_KEY) ?? 0);
      if (dismissedAt && Date.now() - dismissedAt < HIDE_FOR_MS) return;
      if (window.sessionStorage.getItem(SEEN_KEY) === "1") return;
    } catch {
      // Storage unavailable (private mode, blocked cookies): show at most once
      // per page load rather than never.
    }

    let cancelled = false;
    let revealed = false;
    let timer: number | undefined;

    // The AI assistant opens by itself about a second after landing and stays
    // open until it is dismissed, so waiting for it to close meant this card
    // never appeared at all. On a wide screen the two panels sit in opposite
    // corners and can coexist. On a phone both go full width and would stack,
    // so there the card still waits for the assistant to be closed.
    const COEXIST_MIN_WIDTH = 900;
    const assistantBlocks = () =>
      window.innerWidth < COEXIST_MIN_WIDTH && Boolean(document.querySelector(".assistant-widget.show"));

    const reveal = () => {
      if (cancelled || revealed) return;
      if (assistantBlocks()) {
        timer = window.setTimeout(reveal, RETRY_MS);
        return;
      }

      revealed = true;
      setVisible(true);
      try {
        window.sessionStorage.setItem(SEEN_KEY, "1");
      } catch {
        // Ignore; the card is already on screen.
      }
      trackSiteEvent("cohort_invite_impression", { pathname });
    };

    const onScroll = () => {
      if (cancelled) return;
      const scrolled = window.scrollY + window.innerHeight;
      if (scrolled / Math.max(document.body.scrollHeight, 1) >= 0.45) {
        window.removeEventListener("scroll", onScroll);
        window.clearTimeout(timer);
        timer = window.setTimeout(reveal, 1500);
      }
    };

    timer = window.setTimeout(reveal, FIRST_ATTEMPT_MS);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [pathname]);

  const dismiss = () => {
    setVisible(false);
    trackSiteEvent("cohort_invite_dismiss", { pathname });
    try {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // Storage unavailable — the card stays gone for this page view.
    }
  };

  if (!visible) return null;

  return (
    <aside className="cohort-invite" aria-label="Yabloko Labs cohort for students">
      <button type="button" className="cohort-invite-close" onClick={dismiss} aria-label="Dismiss cohort invitation">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
      <span className="cohort-invite-badge">For students &amp; recent graduates</span>
      <p className="cohort-invite-title">Ship software with a team in six weeks</p>
      <p className="cohort-invite-copy">
        Three two-week sprints, real pull requests, and a release you can show in interviews. Registering interest is
        free.
      </p>
      <Link href="/cohort" className="btn btn-primary cohort-invite-cta" onClick={() => trackSiteEvent("cohort_invite_click", { pathname })}>
        See the Cohort
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </Link>
    </aside>
  );
}
