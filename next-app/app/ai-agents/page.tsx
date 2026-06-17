import type { Metadata } from "next";
import SiteNavigation from "../components/SiteNavigation";
import SiteFooter from "../components/SiteFooter";
import BackToTopButton from "../components/BackToTopButton";
import AiAgentsLeadForm from "../components/AiAgentsLeadForm";

const useCases = [
  {
    title: "Engineering & DevOps",
    items: [
      "Kubernetes RCA Agents",
      "CI/CD Failure Analysis Agents",
      "Infrastructure Monitoring Agents",
      "Cloud Cost Optimization Agents",
      "Security Compliance Agents",
    ],
  },
  {
    title: "Customer Operations",
    items: [
      "Customer Support Agents",
      "Lead Qualification Agents",
      "Customer Success Agents",
      "Appointment Scheduling Agents",
    ],
  },
  {
    title: "Internal Operations",
    items: [
      "Knowledge Management Agents",
      "Reporting Agents",
      "Executive Assistant Agents",
      "Finance Workflow Agents",
    ],
  },
  {
    title: "Industry-Specific Solutions",
    items: [
      "Healthcare Agents",
      "Manufacturing Agents",
      "Retail Agents",
      "Logistics Agents",
    ],
  },
];

const deliverySteps = [
  "Discovery & Business Analysis",
  "Agent Architecture Design",
  "Development & Integration",
  "Deployment & Production Rollout",
  "Continuous Operations & Optimization",
];

const whyYabloko = [
  "UK-based company",
  "Custom-built AI Agent systems",
  "Cloud-agnostic deployments",
  "Vendor-neutral architecture",
  "Ongoing optimization",
  "Modern AI Agent expertise",
  "Business-outcome driven delivery",
  "Direct access to technical leadership",
];

const capabilities = [
  "AI Engineering",
  "Agent Architecture",
  "Cloud Infrastructure",
  "DevOps Automation",
  "Enterprise Integrations",
  "Custom Software Development",
  "AI Operations",
  "Platform Engineering",
];

const pricingTiers = [
  {
    label: "Starter",
    price: "From £4,000/month",
    idealFor: ["Single AI Agent", "Targeted workflow automation", "Early AI initiatives"],
    includes: ["Discovery", "Architecture", "Development", "Deployment", "Maintenance"],
  },
  {
    label: "Growth",
    price: "From £8,000/month",
    idealFor: ["Multiple AI Agents", "Cross-team workflows", "Operational automation programmes"],
    includes: ["Everything in Starter", "Additional integrations", "Enhanced monitoring", "Monthly optimization reviews"],
    featured: true,
  },
  {
    label: "Enterprise",
    price: "From £15,000/month",
    idealFor: ["Multi-agent ecosystems", "Enterprise-wide automation", "Advanced infrastructure requirements"],
    includes: ["Everything in Growth", "Dedicated architecture support", "Enterprise governance", "Priority support"],
  },
];

export const metadata: Metadata = {
  title: "AI Agents | Yabloko Labs",
  description:
    "Custom AI Agents built, deployed, and managed by Yabloko Labs. From DevOps and customer support to operational automation, we deliver production-ready AI Agent systems.",
  keywords: [
    "AI Agents",
    "Custom AI Agents",
    "AI Agent Development",
    "Enterprise AI Agents",
    "Agentic AI",
    "OpenClaw Agents",
    "Hermes Agents",
    "Business Automation",
    "AI Consulting",
  ],
  alternates: {
    canonical: "https://yablokolabs.com/ai-agents",
  },
  openGraph: {
    title: "AI Agents | Yabloko Labs",
    description:
      "Custom AI Agents built, deployed, and managed by Yabloko Labs. Production-ready systems for automation, operations, and growth.",
    url: "https://yablokolabs.com/ai-agents",
    siteName: "Yabloko Labs",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Agents | Yabloko Labs",
    description:
      "Custom AI Agents built, deployed, and managed by Yabloko Labs. Production-ready systems for automation, operations, and growth.",
  },
};

export default function AIAgentsPage() {
  return (
    <>
      <SiteNavigation subpage />

      <section className="hero ai-hero">
        <div className="hero-content ai-hero-grid">
          <div className="ai-hero-copy">
            <div className="hero-badge">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 12l2 2 4-4" />
                <path d="M12 3l7 4v5c0 5-3.5 8-7 9-3.5-1-7-4-7-9V7l7-4z" />
              </svg>
              AI Agents For Business
            </div>
            <h1 className="hero-title">Custom AI Agents Built, Deployed &amp; Operated For Your Business</h1>
            <p className="hero-subtitle">
              Yabloko Labs designs, builds, deploys, and manages custom AI Agents that automate workflows, improve
              operational efficiency, and deliver measurable business outcomes.
            </p>
            <p className="hero-subtitle ai-hero-subcopy">
              From OpenClaw agents and Hermes agents to fully custom multi-agent systems, we handle architecture,
              infrastructure, orchestration, monitoring, and maintenance so your team can focus on business results.
            </p>
            <div className="cta-buttons">
              <a href="#consultation" className="btn btn-primary">
                Book a Discovery Call
              </a>
            </div>
          </div>

          <div className="ai-hero-visual" aria-hidden="true">
            <div className="ai-hero-panel ai-hero-panel-primary">
              <span className="ai-panel-label">Business Systems</span>
              <div className="ai-panel-grid">
                <span>CRM</span>
                <span>Support</span>
                <span>DevOps</span>
                <span>ERP</span>
              </div>
            </div>
            <div className="ai-hero-flow">
              <div className="ai-flow-node">
                <strong>OpenClaw</strong>
                <span>Execution agents</span>
              </div>
              <div className="ai-flow-node">
                <strong>Hermes</strong>
                <span>Orchestration &amp; routing</span>
              </div>
              <div className="ai-flow-node">
                <strong>Guardrails</strong>
                <span>Approvals, policies, observability</span>
              </div>
            </div>
            <div className="ai-hero-panel">
              <span className="ai-panel-label">Operational Outcomes</span>
              <div className="ai-outcome-metrics">
                <div>
                  <strong>Faster</strong>
                  <span>workflow execution</span>
                </div>
                <div>
                  <strong>Lower</strong>
                  <span>manual overhead</span>
                </div>
                <div>
                  <strong>Clear</strong>
                  <span>monitoring &amp; reporting</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="ai-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Business Outcomes</span>
            <h2 className="section-title">Business Outcomes, Not AI Complexity</h2>
            <p className="section-subtitle">
              Clients should never need to manage the hidden AI stack. We own the operational complexity so your team
              can stay focused on results.
            </p>
          </div>

          <div className="outcomes-surfaces">
            <div className="outcome-surface">
              <h3>Yabloko Labs handles</h3>
              <div className="pill-cloud">
                {["models", "tokens", "vector databases", "orchestration frameworks", "infrastructure", "monitoring", "scaling", "maintenance"].map((item) => (
                  <span key={item} className="pill-chip">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="outcome-surface">
              <h3>Your team focuses on</h3>
              <div className="pill-cloud">
                {["revenue growth", "customer experience", "operational efficiency", "engineering productivity", "business automation"].map((item) => (
                  <span key={item} className="pill-chip pill-chip-bright">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="outcomes-grid">
            {[
              {
                title: "Operational Efficiency",
                copy: "Reduce repetitive manual work and free up teams for higher-value execution.",
              },
              {
                title: "Faster Response Times",
                copy: "Automate analysis, triage, and decision support across support, engineering, and operations.",
              },
              {
                title: "Measurable Automation",
                copy: "Ship agents around tracked business outcomes with reporting, alerts, and optimization loops.",
              },
              {
                title: "Production-Grade Reliability",
                copy: "Deploy with observability, approvals, escalation paths, and ongoing operational management.",
              },
            ].map((card) => (
              <div key={card.title} className="outcome-card">
                <h3>{card.title}</h3>
                <p>{card.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ai-section ai-section-muted">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Use Cases</span>
            <h2 className="section-title">AI Agents Built Around Real Business Problems</h2>
            <p className="section-subtitle">
              We design agents around workflows that matter to engineering, customer operations, leadership, and
              industry teams.
            </p>
          </div>

          <div className="use-cases-grid">
            {useCases.map((group) => (
              <div key={group.title} className="use-case-card">
                <h3>{group.title}</h3>
                <ul className="use-case-list">
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ai-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Architecture</span>
            <h2 className="section-title">Built Using Modern Agent Architectures</h2>
            <p className="section-subtitle">
              Yabloko Labs develops production-grade AI Agent systems designed for operational resilience, clear
              observability, and enterprise deployment.
            </p>
          </div>

          <div className="architecture-grid">
            <div className="architecture-card">
              <h3>Agent patterns we deliver</h3>
              <div className="pill-cloud">
                {[
                  "OpenClaw Agents",
                  "Hermes Agents",
                  "Multi-Agent Systems",
                  "Retrieval-Augmented Agents",
                  "Human-in-the-Loop Agents",
                  "Workflow Automation Agents",
                  "Knowledge-Driven Agents",
                ].map((item) => (
                  <span key={item} className="pill-chip">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="architecture-card architecture-visual-card" aria-hidden="true">
              <div className="architecture-layer">
                <span>Business Systems</span>
                <small>Slack · Email · CRM · Kubernetes · Internal APIs</small>
              </div>
              <div className="architecture-layer architecture-layer-highlight">
                <span>Agent Control Plane</span>
                <small>OpenClaw · Hermes · Policies · Memory · Retrieval</small>
              </div>
              <div className="architecture-layer">
                <span>Operations Layer</span>
                <small>Monitoring · Alerting · Escalations · Continuous optimization</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="ai-section ai-section-muted">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Delivery Model</span>
            <h2 className="section-title">How We Deliver AI Agents</h2>
            <p className="section-subtitle">
              A structured rollout model keeps implementation focused, measurable, and production-ready.
            </p>
          </div>

          <div className="delivery-timeline">
            {deliverySteps.map((step, index) => (
              <div key={step} className="delivery-step">
                <div className="delivery-step-number">{String(index + 1).padStart(2, "0")}</div>
                <div className="delivery-step-content">
                  <h3>{step}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ai-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Why Yabloko Labs</span>
            <h2 className="section-title">Enterprise AI Without Enterprise Complexity</h2>
            <p className="section-subtitle">
              We combine modern agent engineering with practical delivery and direct technical leadership.
            </p>
          </div>

          <div className="why-grid">
            {whyYabloko.map((item) => (
              <div key={item} className="why-card">
                <h3>{item}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ai-section ai-section-muted">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Pricing</span>
            <h2 className="section-title">Simple Engagement Models</h2>
            <p className="section-subtitle">
              Choose a starting point based on your operational scope, then expand as your automation surface grows.
            </p>
          </div>

          <div className="pricing-grid">
            {pricingTiers.map((tier) => (
              <div key={tier.label} className={`pricing-card${tier.featured ? " pricing-card-featured" : ""}`}>
                <div className="pricing-card-header">
                  <span className="pricing-badge">{tier.label}</span>
                  <h3>{tier.price}</h3>
                </div>
                <div className="pricing-block">
                  <h4>Ideal for</h4>
                  <ul className="pricing-list">
                    {tier.idealFor.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="pricing-block">
                  <h4>Includes</h4>
                  <ul className="pricing-list">
                    {tier.includes.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className="pricing-cta">
            <a href="#consultation" className="btn btn-primary">
              Book Consulting
            </a>
          </div>

          <p className="pricing-disclaimer">
            Final pricing depends on complexity, integrations, infrastructure requirements, compliance requirements, and
            operational scope.
          </p>
        </div>
      </section>

      <section className="ai-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Trust &amp; Capabilities</span>
            <h2 className="section-title">Production Capability Across The Full Stack</h2>
            <p className="section-subtitle">
              Expertise across architecture, engineering, infrastructure, and operational management.
            </p>
          </div>

          <div className="capabilities-grid">
            {capabilities.map((item) => (
              <div key={item} className="capability-chip">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="consultation" className="ai-section ai-section-muted">
        <div className="container">
          <div className="lead-card">
            <div className="lead-copy">
              <span className="section-badge">Lead Capture</span>
              <h2 className="section-title">Ready To Deploy AI Agents?</h2>
              <p className="section-subtitle lead-subtitle">
                Tell us your business challenge and we&apos;ll show you how AI Agents can help.
              </p>
              <div className="lead-side-panel">
                <div>
                  <strong>Discovery-led delivery</strong>
                  <span>We scope around outcomes, integrations, and operational constraints.</span>
                </div>
                <div>
                  <strong>Production-ready deployment</strong>
                  <span>Cloud-agnostic rollout, observability, maintenance, and optimization included.</span>
                </div>
                <div>
                  <strong>Direct access to technical leadership</strong>
                  <span>Speak with the team designing the architecture and operating the systems.</span>
                </div>
              </div>
            </div>
            <AiAgentsLeadForm />
          </div>
        </div>
      </section>

      <SiteFooter />
      <BackToTopButton />
    </>
  );
}
