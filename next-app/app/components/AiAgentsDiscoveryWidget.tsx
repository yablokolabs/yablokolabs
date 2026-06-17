"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { trackSiteEvent } from "./analytics";

let hasTrackedWidgetImpression = false;

export default function AiAgentsDiscoveryWidget() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (pathname === "/ai-agents") {
      setVisible(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setVisible(true);

      if (!hasTrackedWidgetImpression) {
        trackSiteEvent("ai_agents_widget_impression", { pathname });
        hasTrackedWidgetImpression = true;
      }
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [pathname]);

  const handleDismiss = () => {
    trackSiteEvent("ai_agents_widget_dismiss", { pathname });
    setVisible(false);
  };

  const handleClick = () => {
    trackSiteEvent("ai_agents_widget_click", { pathname, destination: "/ai-agents" });
  };

  if (pathname === "/ai-agents") return null;

  return (
    <aside className={`agents-widget${visible ? " show" : ""}`} aria-label="AI Agents discovery widget">
      <div className="agents-widget-badge">AI Agent Services</div>
      <h3>Need AI Agents?</h3>
      <p>
        We design, deploy, and operate custom AI Agents that automate workflows, support teams, and deliver measurable
        business outcomes.
      </p>
      <div className="agents-widget-actions">
        <Link href="/ai-agents" className="btn btn-primary agents-widget-primary" onClick={handleClick}>
          Explore AI Agents
        </Link>
        <button type="button" className="agents-widget-dismiss" onClick={handleDismiss}>
          Dismiss
        </button>
      </div>
    </aside>
  );
}
