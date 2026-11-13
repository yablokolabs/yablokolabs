import type { Metadata } from "next";
import Link from "next/link";
import BackToTopButton from "../components/BackToTopButton";
import Breadcrumbs from "../components/Breadcrumbs";
import SiteFooter from "../components/SiteFooter";
import SiteNavigation from "../components/SiteNavigation";

const CAREER_EMAIL = "career@yablokolabs.com";
const APPLY_HREF = `mailto:${CAREER_EMAIL}`;
const SALES_APPLY_HREF = `mailto:${CAREER_EMAIL}?subject=Sales%20Shark%20Application`;
const ENGINEERING_APPLY_HREF = `mailto:${CAREER_EMAIL}?subject=Apple%20Platforms%20Engineer%20Application`;

const salesMeta = ["Remote / flexible", "Uncapped commission", "Full-time or fractional", "UK or worldwide"];

const salesResponsibilities = [
  "Open new logos: outbound email, LinkedIn, calls, and warm introductions into companies that need AI.",
  "Build and own your pipeline end to end — from first touch to signed contract.",
  "Run discovery calls and turn business pain into a clear, outcome-led proposal.",
  "Sell our AI agents, MCP servers, and quantum-AI brands with technical support from our engineers.",
  "Bring in referral partners and repeat business, not just one-off deals.",
  "Hand clean, well-documented deals to delivery so clients start strong.",
];

const salesRequirements = [
  "A proven record of closing B2B deals in SaaS, tech services, or consulting.",
  "A network you can activate — founders, operators, or enterprise buyers.",
  "Hunter mentality: you would rather build pipeline than wait for inbound.",
  "Comfort selling outcomes when the technology is new to the buyer.",
  "Clear written and verbal communication, with the discipline to track your own pipeline.",
  "Self-directed and comfortable working without a big sales playbook.",
];

const salesPerks = [
  {
    title: "Uncapped commission",
    copy: "Earn on every closed deal. No cap, no sliding scale that punishes you for winning.",
  },
  {
    title: "Direct line to the top",
    copy: "Pitch, price, and close with the CEO and the engineers who build the product.",
  },
  {
    title: "Proof, not vapour",
    copy: "You are selling shipped AI agents, five published MCP servers, and four quantum-AI brands.",
  },
  {
    title: "Work your way",
    copy: "Remote, flexible hours, full-time or fractional. We care about the customers you bring.",
  },
];

const appleMeta = ["Remote / flexible", "Full-time", "UK or worldwide", "Production App Store experience"];

const appleResponsibilities = [
  "Ship production apps for iPhone, iPad, and Apple TV — from design hand-off to App Store release.",
  "Own the native client layer for our AI agents and quantum-AI products on Apple platforms.",
  "Build fast, accessible interfaces with Swift, SwiftUI, and UIKit, including tvOS focus and navigation.",
  "Integrate APIs, authentication, payments, and real-time data into native experiences.",
  "Run release engineering: signing, provisioning, TestFlight, App Review, and post-release monitoring.",
  "Work with the AI engineering team to surface agent workflows inside the app.",
];

const appleRequirements = [
  "Production experience shipping apps for iPhone, iPad, and Apple TV to the App Store.",
  "Strong Swift plus SwiftUI or UIKit skills, with attention to performance and accessibility.",
  "Comfort owning a product end to end, including releases and ongoing maintenance.",
  "Experience integrating REST or GraphQL APIs, auth, and real-time updates.",
  "Clear communication and the ability to work with a small remote team.",
  "App Store links or a portfolio showing apps you have actually shipped.",
];

const applePerks = [
  {
    title: "Product ownership",
    copy: "You shape the client experience for AI products, not a ticket queue inside a large team.",
  },
  {
    title: "Native, not wrapped",
    copy: "Real Swift and SwiftUI work across iPhone, iPad, and Apple TV — no web-view shortcuts.",
  },
  {
    title: "Direct access",
    copy: "Work alongside the engineers building the agents and the leadership making product calls.",
  },
  {
    title: "Remote by default",
    copy: "Flexible hours with a small team that ships, reviews, and releases together.",
  },
];

const steps = [
  {
    title: "Send your record",
    copy:
      `Email ${CAREER_EMAIL} with the deals you have closed or App Store links to apps you have shipped. Evidence, not adjectives.`,
  },
  {
    title: "Meet the team",
    copy: "A short call with the people you would work with — leadership for sales, the engineers for Apple platforms.",
  },
  {
    title: "Start on a real brief",
    copy: "If the fit is right, you start on a live deal or a real product brief and take it from there.",
  },
];

const faqs = [
  {
    question: "Is the Sales role full-time?",
    answer:
      "It can be. We hire full-time Sales Sharks as well as fractional or commission-led hunters who bring their own network and work on their own schedule.",
  },
  {
    question: "Is the Apple platforms role full-time?",
    answer:
      "Yes. The engineering role is full-time and remote, with flexible hours. We care about production experience and shipped apps, not your time zone.",
  },
  {
    question: "What Apple experience do you need?",
    answer:
      "Production experience shipping apps for iPhone, iPad, and Apple TV: Swift and SwiftUI or UIKit, plus App Store releases you can point to. This is not a learning-on-the-job role.",
  },
  {
    question: "Do I need to be based in the UK?",
    answer:
      "No. Yabloko Labs is based in London and sells worldwide, so you can work remotely from anywhere as long as you can reach the customers you are targeting.",
  },
  {
    question: "Do I need to understand AI or quantum computing?",
    answer:
      "You need to be curious, not a specialist. Our engineers handle the deep product questions. For sales, we need you to open doors and close. For Apple platforms, we need you to ship great native apps.",
  },
  {
    question: "How do I apply?",
    answer:
      `Email ${CAREER_EMAIL} with the subject "Sales Shark Application" or "Apple Platforms Engineer Application". Include your track record or shipped apps, and your LinkedIn or CV.`,
  },
];

export const metadata: Metadata = {
  title: "Careers | Yabloko Labs",
  description:
    "Careers at Yabloko Labs. Sales and Engineering are open: Sales Sharks who bring in new customers, and Apple platforms engineers with production experience across iPhone, iPad, and Apple TV.",
  keywords: [
    "Yabloko Labs careers",
    "careers",
    "sales jobs",
    "business development",
    "AI sales",
    "sales shark",
    "commission sales",
    "remote sales",
    "iOS engineer",
    "iPad developer",
    "Apple TV developer",
    "tvOS engineer",
    "Swift jobs",
  ],
  alternates: {
    canonical: "https://yablokolabs.com/careers",
  },
  openGraph: {
    type: "website",
    url: "https://yablokolabs.com/careers",
    siteName: "Yabloko Labs",
    title: "Careers | Yabloko Labs",
    description:
      "Sales and Engineering are open. We are hiring Sales Sharks and Apple platforms engineers with production experience across iPhone, iPad, and Apple TV.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Careers | Yabloko Labs",
    description:
      "Sales and Engineering are open. We are hiring Sales Sharks and Apple platforms engineers with production experience.",
  },
};

const webPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://yablokolabs.com/careers#webpage",
  url: "https://yablokolabs.com/careers",
  name: "Careers | Yabloko Labs",
  description:
    "Careers at Yabloko Labs. Sales and Engineering are open, including Sales Sharks and Apple platforms engineers for iPhone, iPad, and Apple TV.",
  inLanguage: "en",
  isPartOf: { "@id": "https://yablokolabs.com/#website" },
  about: { "@id": "https://yablokolabs.com/#organization" },
};

const hiringOrganization = {
  "@type": "Organization",
  name: "Yabloko Labs",
  sameAs: "https://yablokolabs.com",
  logo: "https://yablokolabs.com/assets/images/yablokolabs-logo-symbol.png",
};

const jobAddress = {
  "@type": "PostalAddress",
  streetAddress: "71-75 Shelton Street, Covent Garden",
  addressLocality: "London",
  postalCode: "WC2H 9JQ",
  addressCountry: "GB",
};

const jobsJsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: "Sales Shark (New Business)",
    description:
      "Yabloko Labs is hiring Sales Sharks who can open new logos and bring in new customers for its custom AI agents, MCP servers, and quantum-AI products. The role owns outbound pipeline, discovery, proposals, and closing, with technical support from the engineering team.",
    datePosted: "2026-11-13",
    employmentType: "OTHER",
    industry: "Information Technology",
    occupationalCategory: "Sales and Related",
    hiringOrganization,
    jobLocation: {
      "@type": "Place",
      address: jobAddress,
    },
    jobLocationType: "TELECOMMUTE",
    applicantLocationRequirements: {
      "@type": "Country",
      name: "Worldwide",
    },
    url: "https://yablokolabs.com/careers#sales",
    directApply: false,
  },
  {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: "Senior Apple Platforms Engineer (iPhone, iPad & Apple TV)",
    description:
      "Yabloko Labs is hiring an Apple platforms engineer with production experience shipping apps for iPhone, iPad, and Apple TV. The role owns the native client layer for its AI agents and quantum-AI products, using Swift, SwiftUI, and UIKit, and runs releases through TestFlight, App Review, and post-release monitoring.",
    datePosted: "2026-11-13",
    employmentType: "FULL_TIME",
    industry: "Information Technology",
    occupationalCategory: "Software Development",
    hiringOrganization,
    jobLocation: {
      "@type": "Place",
      address: jobAddress,
    },
    jobLocationType: "TELECOMMUTE",
    applicantLocationRequirements: {
      "@type": "Country",
      name: "Worldwide",
    },
    url: "https://yablokolabs.com/careers#engineering",
    directApply: false,
  },
];

export default function CareerPage() {
  return (
    <>
      <SiteNavigation subpage />
      <Breadcrumbs trail={[{ name: "Careers", url: "https://yablokolabs.com/careers" }]} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jobsJsonLd) }} />

      <section className="hero ai-hero">
        <div className="hero-content">
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
              <path d="M2 12s2.5-5 8-5c4.5 0 7 2 9 4-2 2-4.5 4-9 4-5.5 0-8-3-8-3z" />
              <path d="M20 11l2-3v7l-2-3" />
              <circle cx="7" cy="11" r="0.75" fill="currentColor" />
            </svg>
            Careers at Yabloko Labs
          </div>
          <h1 className="hero-title">
            Come Hunt and Build With <span className="career-gradient">Yabloko Labs</span>
          </h1>
          <p className="hero-subtitle">
            We build AI agents and hybrid quantum-AI software for businesses. We are hiring Sales Sharks who can bring in
            new customers, and Apple platforms engineers who have shipped production apps for iPhone, iPad, and Apple TV.
          </p>
          <div className="cta-buttons">
            <a href="#categories" className="btn btn-primary">
              See Open Categories
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
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
            <a href={APPLY_HREF} className="btn btn-outline">
              Apply Now
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      <section id="categories" className="ai-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Open Categories</span>
            <h2 className="section-title">Where We&apos;re Hiring</h2>
            <p className="section-subtitle">
              Sales and Engineering are open. Research opens as the team grows.
            </p>
          </div>

          <div className="career-category-grid">
            <a href="#sales" className="career-category career-category-main">
              <span className="career-category-kicker">01 · Main Category</span>
              <h3>Sales</h3>
              <p>
                Hunters who can bring in new customers and new business. If you can open doors we have not opened yet,
                this is your track.
              </p>
              <span className="career-category-status">
                1 opening · Sales Shark
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </a>

            <a href="#engineering" className="career-category career-category-open">
              <span className="career-category-kicker">02 · Category</span>
              <h3>Engineering</h3>
              <p>
                Native Apple software in production. We are hiring an engineer who has shipped apps for iPhone, iPad,
                and Apple TV.
              </p>
              <span className="career-category-status">
                1 opening · Apple Platforms
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </a>

            <div className="career-category career-category-muted">
              <span className="career-category-kicker">03 · Research</span>
              <h3>Research</h3>
              <p>Standards, evaluation, and quantum algorithms. No openings yet.</p>
              <span className="career-category-status">Closed for now</span>
            </div>
          </div>
        </div>
      </section>

      <section id="sales" className="ai-section ai-section-muted">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Sales · Main Category</span>
            <h2 className="section-title">Sales Sharks Wanted</h2>
            <p className="section-subtitle">
              We are looking for people who can bring in new customers, new logos, and new business — not manage a
              pipeline someone else built.
            </p>
          </div>

          <div className="career-role-card">
            <div className="career-role-head">
              <div>
                <span className="career-role-kicker">Open role · Multiple openings</span>
                <h3>Sales Shark — New Business</h3>
              </div>
              <span className="career-role-tag">Commission-led</span>
            </div>

            <div className="career-meta">
              {salesMeta.map((item) => (
                <span key={item} className="pill-chip">
                  {item}
                </span>
              ))}
            </div>

            <div className="career-columns">
              <div>
                <h4>What you&apos;ll do</h4>
                <ul className="career-list">
                  {salesResponsibilities.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4>What we&apos;re looking for</h4>
                <ul className="career-list">
                  {salesRequirements.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="career-perks">
              {salesPerks.map((perk) => (
                <div key={perk.title} className="career-perk">
                  <strong>{perk.title}</strong>
                  <span>{perk.copy}</span>
                </div>
              ))}
            </div>

            <div className="pricing-cta">
              <a href={SALES_APPLY_HREF} className="btn btn-primary">
                Apply for Sales
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
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>
            <p className="career-role-note">
              Applications go to <a href={`mailto:${CAREER_EMAIL}`}>{CAREER_EMAIL}</a>. Include your track record, the
              market you can open, and a LinkedIn or CV.
            </p>
          </div>
        </div>
      </section>

      <section id="engineering" className="ai-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Engineering · Apple Platforms</span>
            <h2 className="section-title">Ship Native Apps on iPhone, iPad &amp; Apple TV</h2>
            <p className="section-subtitle">
              We need an engineer with production experience, not a portfolio of tutorials. If you have shipped Apple
              apps that real people use, we want to see them.
            </p>
          </div>

          <div className="career-role-card">
            <div className="career-role-head">
              <div>
                <span className="career-role-kicker">Open role · Production experience required</span>
                <h3>Senior Apple Platforms Engineer — iPhone, iPad &amp; Apple TV</h3>
              </div>
              <span className="career-role-tag">Full-time</span>
            </div>

            <div className="career-meta">
              {appleMeta.map((item) => (
                <span key={item} className="pill-chip">
                  {item}
                </span>
              ))}
            </div>

            <div className="career-columns">
              <div>
                <h4>What you&apos;ll do</h4>
                <ul className="career-list">
                  {appleResponsibilities.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4>What we&apos;re looking for</h4>
                <ul className="career-list">
                  {appleRequirements.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="career-perks">
              {applePerks.map((perk) => (
                <div key={perk.title} className="career-perk">
                  <strong>{perk.title}</strong>
                  <span>{perk.copy}</span>
                </div>
              ))}
            </div>

            <div className="pricing-cta">
              <a href={ENGINEERING_APPLY_HREF} className="btn btn-primary">
                Apply for Engineering
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
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>
            <p className="career-role-note">
              Applications go to <a href={`mailto:${CAREER_EMAIL}`}>{CAREER_EMAIL}</a>. Include App Store links to the
              iPhone, iPad, or Apple TV apps you have shipped, plus a CV.
            </p>
          </div>
        </div>
      </section>

      <section className="ai-section ai-section-muted">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">How It Works</span>
            <h2 className="section-title">From First Email To First Shipment</h2>
            <p className="section-subtitle">No eight-round interview gauntlet. Show us you can do the work.</p>
          </div>

          <div className="career-steps">
            {steps.map((step, index) => (
              <div key={step.title} className="career-step">
                <span className="career-step-number">{String(index + 1).padStart(2, "0")}</span>
                <h3>{step.title}</h3>
                <p>{step.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="apply" className="partnership-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Apply</span>
            <h2 className="section-title">Two Tracks. One Inbox.</h2>
            <p className="section-subtitle">
              Sales or Apple platforms engineering — send your record straight to the team.
            </p>
          </div>

          <div className="partnership-card">
            <div className="partnership-content">
              <div className="partnership-badge">
                <svg
                  width="44"
                  height="44"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#FFD700"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <h3>Apply To Yabloko Labs</h3>
              <div className="partnership-details">
                <p>
                  Send one email. Tell us which track you want and show evidence you can do the work. We reply
                  personally.
                </p>

                <ul className="partnership-features">
                  <li>
                    Email <a href={`mailto:${CAREER_EMAIL}`}>{CAREER_EMAIL}</a> with the subject &ldquo;Sales Shark
                    Application&rdquo; or &ldquo;Apple Platforms Engineer Application&rdquo;
                  </li>
                  <li>Sales: your best wins, the market you can open, and a LinkedIn or CV</li>
                  <li>Engineering: App Store links to iPhone, iPad, or Apple TV apps you have shipped, plus a CV</li>
                  <li>We reply personally — no application portal, no ghosting</li>
                </ul>

                <div className="partnership-cta">
                  <a href={APPLY_HREF} className="btn btn-primary">
                    Email {CAREER_EMAIL}
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </a>
                </div>

                <p className="partnership-note">
                  Not looking for a role, but know buyers? Our{" "}
                  <Link href="/#partnership">partner programme</Link> pays commission on referrals too.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="career-faq" className="ai-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">FAQ</span>
            <h2 className="section-title">Questions Before You Apply</h2>
            <p className="section-subtitle">Straight answers before you send your application.</p>
          </div>

          <div className="faq-grid">
            {faqs.map((faq) => (
              <div key={faq.question} className="faq-item">
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
      <BackToTopButton />
    </>
  );
}
