import type { Metadata } from "next";
import AiAgentsLeadForm from "../components/AiAgentsLeadForm";
import BackToTopButton from "../components/BackToTopButton";
import SiteFooter from "../components/SiteFooter";
import SiteNavigation from "../components/SiteNavigation";

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

const standards = [
  {
    code: "ISO/IEC 42001",
    scope: "Organisational standard",
    scopeKind: "org",
    title: "AI Management Systems",
    body:
      "Certification belongs to your organisation, not to a supplier. We build agents that fit inside a 42001 management system — defined objectives, assigned roles, change control, and the records your AIMS has to produce at audit.",
  },
  {
    code: "ISO/IEC 23894",
    scope: "Engineering process",
    scopeKind: "eng",
    title: "AI Risk Management",
    body:
      "Applied directly in how we build. Every agent ships with a risk register: identified harms, likelihood, treatment, and residual risk — reviewed and signed off, not assumed.",
  },
  {
    code: "ISO/IEC 5338",
    scope: "Engineering process",
    scopeKind: "eng",
    title: "AI System Life Cycle Processes",
    body:
      "A defined life cycle from concept to retirement — requirements, verification, deployment, monitoring, and decommissioning. Each stage has an owner and leaves an artifact behind.",
  },
  {
    code: "ISO/IEC 27001 · 27701",
    scope: "Organisational standard",
    scopeKind: "org",
    title: "Security & Privacy",
    body:
      "Engineered on their control objectives: least-privilege access, sandboxed execution, data minimisation, and privacy by design. Your ISMS and PIMS stay certifiable; the agent does not put that at risk.",
  },
];

const assurances = [
  {
    title: "Sandboxed execution, least-privilege access",
    copy: "Harder to compromise, and blast radius is bounded by design.",
  },
  {
    title: "Risk register and reliability testing",
    copy: "Failure modes identified and tested, not discovered in production.",
  },
  {
    title: "Life cycle documentation and audit trails",
    copy: "You can prove how the agent works — to a regulator, or to a customer.",
  },
  {
    title: "Privacy by design, data minimisation",
    copy: "The agent holds the least data that still does the job.",
  },
];

const pricingTiers = [
  {
    label: "Starter",
    price: "From £399/month",
    idealFor: ["Single AI Agent", "Targeted workflow automation", "Early AI initiatives"],
    includes: ["Discovery", "Architecture", "Development", "Deployment", "Maintenance"],
  },
  {
    label: "Growth",
    price: "From £799/month",
    idealFor: ["Multiple AI Agents", "Cross-team workflows", "Operational automation programmes"],
    includes: [
      "Everything in Starter",
      "Additional integrations",
      "Enhanced monitoring",
      "Monthly optimization reviews",
    ],
    featured: true,
  },
  {
    label: "Enterprise",
    price: "From £1,499/month",
    idealFor: ["Multi-agent ecosystems", "Enterprise-wide automation", "Advanced infrastructure requirements"],
    includes: ["Everything in Growth", "Dedicated architecture support", "Enterprise governance", "Priority support"],
  },
];

export const metadata: Metadata = {
  title: "AI Agents | Yabloko Labs",
  description:
    "Custom AI Agents built, deployed and managed by Yabloko Labs. Engineered against ISO/IEC 42001, 23894 and 5338 so your agents stay auditable in production.",
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
    "AI Governance",
    "Responsible AI",
    "Auditable AI Agents",
    "AI Risk Management",
    "ISO/IEC 42001",
    "ISO/IEC 23894",
    "ISO/IEC 5338",
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

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Custom AI Agent Development & Operations",
  description:
    "Yabloko Labs designs, builds, deploys, and manages custom AI Agents for business automation. From DevOps and customer support to operational automation, we deliver production-ready AI Agent systems.",
  provider: {
    "@type": "Organization",
    name: "Yabloko Labs Ltd",
    url: "https://yablokolabs.com",
    logo: "https://yablokolabs.com/assets/images/yablokolabs-logo-symbol.png",
    sameAs: [
      "https://www.linkedin.com/in/yabloko-labs-4858bb366/",
      "https://github.com/yablokolabs",
      "https://www.instagram.com/yabloko_labs/",
      "https://www.facebook.com/people/yablokolabs/61578265855070",
      "https://www.youtube.com/@map2map",
    ],
    address: {
      "@type": "PostalAddress",
      streetAddress: "71-75 Shelton Street, Covent Garden",
      addressLocality: "London",
      postalCode: "WC2H 9JQ",
      addressCountry: "GB",
    },
  },
  serviceType: "AI Agent Development & Operations",
  areaServed: "Worldwide",
  availableChannel: {
    "@type": "ServiceChannel",
    serviceUrl: "https://yablokolabs.com/ai-agents",
    availableLanguage: "en",
  },
  offers: [
    {
      "@type": "Offer",
      name: "Starter Tier",
      description: "Single AI Agent, targeted workflow automation, early AI initiatives",
      price: "399",
      priceCurrency: "GBP",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "399",
        priceCurrency: "GBP",
        billingDuration: "P1M",
      },
    },
    {
      "@type": "Offer",
      name: "Growth Tier",
      description: "Multiple AI Agents, cross-team workflows, operational automation programmes",
      price: "799",
      priceCurrency: "GBP",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "799",
        priceCurrency: "GBP",
        billingDuration: "P1M",
      },
    },
    {
      "@type": "Offer",
      name: "Enterprise Tier",
      description: "Multi-agent ecosystems, enterprise-wide automation, advanced infrastructure",
      price: "1499",
      priceCurrency: "GBP",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "1499",
        priceCurrency: "GBP",
        billingDuration: "P1M",
      },
    },
  ],
};

const researchJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareSourceCode",
  name: "Trustworthy AI Standardisation for Financial Services",
  description:
    "Assessment of ISO/IEC 42001, 23894, 5338 and the emerging ISO/IEC TS 25570 for production AI, including a controls gap matrix for financial services and a Continuous Reliability Assurance proposal with reference implementation.",
  identifier: "https://doi.org/10.5281/zenodo.21603770",
  url: "https://doi.org/10.5281/zenodo.21603770",
  license: "https://opensource.org/licenses/MIT",
  datePublished: "2026-07-26",
  author: {
    "@type": "Person",
    name: "Santhosh Balasa",
    affiliation: {
      "@type": "Organization",
      name: "Yabloko Labs Ltd",
    },
  },
  publisher: {
    "@type": "Organization",
    name: "Zenodo",
  },
  funding: {
    "@type": "Grant",
    name: "StandICT.eu 2029 Fellowship",
  },
};

export default function AIAgentsPage() {
  return (
    <>
      <SiteNavigation subpage />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(researchJsonLd) }}
      />

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
                {[
                  "models",
                  "tokens",
                  "vector databases",
                  "orchestration frameworks",
                  "infrastructure",
                  "monitoring",
                  "scaling",
                  "maintenance",
                ].map((item) => (
                  <span key={item} className="pill-chip">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="outcome-surface">
              <h3>Your team focuses on</h3>
              <div className="pill-cloud">
                {[
                  "revenue growth",
                  "customer experience",
                  "operational efficiency",
                  "engineering productivity",
                  "business automation",
                ].map((item) => (
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
                  {group.items.map((item) => <li key={item}>{item}</li>)}
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

      <section id="governance" className="ai-section governance-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Governance &amp; Assurance</span>
            <h2 className="section-title">Fast Without Standards Is Just Risk In Production</h2>
            <p className="section-subtitle">
              Most AI Agents are customized to a use case and shipped fast. We do that too &mdash; but we don&apos;t
              skip governance. Customization without control is exactly when systems get compromised, misused, or become
              un-auditable.
            </p>
          </div>

          <h3 className="governance-block-heading">The standards we engineer against</h3>
          <div className="standards-grid">
            {standards.map((standard) => (
              <div key={standard.code} className="standard-card">
                <div className="standard-card-header">
                  <span className="standard-code">{standard.code}</span>
                  <span className={`standard-scope standard-scope-${standard.scopeKind}`}>{standard.scope}</span>
                </div>
                <h4>{standard.title}</h4>
                <p>{standard.body}</p>
              </div>
            ))}
          </div>

          <h3 className="governance-block-heading">What that means for the agent you receive</h3>
          <div className="assurance-grid">
            {assurances.map((item) => (
              <div key={item.title} className="assurance-card">
                <span className="assurance-tick" aria-hidden="true">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </span>
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.copy}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="governance-research">
            <span className="section-badge">Standards Research</span>
            <h3>
              We don&apos;t just read these standards. We&apos;re funded by the EU to analyse where they fall short.
            </h3>
            <p>
              Our assessment of where ISO/IEC 42001, 23894, 5338 and the emerging ISO/IEC TS 25570 fall short for
              production AI is published and citable, produced under an EU-funded StandICT.eu fellowship. It includes a
              controls gap matrix for AI in financial services and a Continuous Reliability Assurance proposal with a
              reference implementation.
            </p>
            <a
              className="governance-doi"
              href="https://doi.org/10.5281/zenodo.21603770"
              target="_blank"
              rel="noopener noreferrer"
            >
              Trustworthy AI Standardisation for Financial Services
              <span>DOI 10.5281/zenodo.21603770</span>
            </a>
          </div>

          <p className="governance-disclaimer">
            Yabloko Labs is not an ISO-certified body and does not claim to be. These standards define how we engineer;
            the evidence we hand over is designed to stand up inside your certified management system.
          </p>
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
                    {tier.idealFor.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
                <div className="pricing-block">
                  <h4>Includes</h4>
                  <ul className="pricing-list">
                    {tier.includes.map((item) => <li key={item}>{item}</li>)}
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
