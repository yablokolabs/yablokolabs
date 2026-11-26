import type { Metadata } from "next";
import Link from "next/link";
import BackToTopButton from "../components/BackToTopButton";
import Breadcrumbs from "../components/Breadcrumbs";
import CohortInterestForm from "../components/CohortInterestForm";
import SiteFooter from "../components/SiteFooter";
import SiteNavigation from "../components/SiteNavigation";

const COHORT_EMAIL = "cohort@yablokolabs.com";

const sprints = [
  {
    title: "Backlog to first demo",
    copy:
      "You get a starter repository and a short backlog. Everyone picks up a ticket, ships a first change, and presents what they built at the end of week two.",
  },
  {
    title: "Features through review",
    copy:
      "The team builds one feature through reviewed pull requests. Sprint lead, code reviewer, and release owner rotate so everyone leads something.",
  },
  {
    title: "Test, release, demo",
    copy:
      "You add tests, fix what review found, cut a release, and present the finished work. The last demo is the piece you walk an interviewer through.",
  },
];

const forYou = [
  "Final-year students and recent graduates who can already build a small app.",
  "Early-career developers who want team practice they cannot get working alone.",
  "People anywhere in the world who can work in written English and join one shared live-session window.",
];

const requirements = [
  "A laptop and reliable internet for the six weeks.",
  "Git basics: clone, branch, commit, push, open a pull request.",
  "One language you can build in — JavaScript/TypeScript, Python, Rust, Go, or similar.",
  "Around 10–12 hours a week, including one live session.",
  "Willingness to review someone else's code and have yours reviewed.",
];

const included = [
  {
    title: "Weekly live session",
    copy: "One shared session each week for planning, demos, and the questions that are hard to answer in writing.",
  },
  {
    title: "Written PR feedback",
    copy: "At least one reviewed pull request per person per sprint, with specific comments rather than a grade.",
  },
  {
    title: "An individual debrief",
    copy: "A short one-to-one at the end: what you did well, what to practise next, and how to talk about the work.",
  },
  {
    title: "Evidence, not just a certificate",
    copy: "A certificate of completion tied to milestones, plus links to your merged PRs, the demo, and a note on what you owned.",
  },
];

const faqs = [
  {
    question: "Is registering interest free?",
    answer:
      "Yes. The form costs nothing and does not commit you to joining. The cohort itself is a paid pilot; dates, the founding-cohort price, and refund terms are sent to the interest list before anyone pays.",
  },
  {
    question: "Do I need to send a CV now?",
    answer:
      "No. Tell us what you have built and link to it if you can. A CV is only useful once we move to a formal application, and asking for one at the interest stage would filter out people who are still deciding.",
  },
  {
    question: "Do I have to be a student?",
    answer:
      "You need to be close to the start of your career: a final-year student, a recent graduate, or an early-career developer. The work assumes you can already build a small app on your own.",
  },
  {
    question: "Is this a beginner course?",
    answer:
      "No. It is a team-practice cohort, not an introduction to programming. You should be comfortable with Git basics and at least one language before you join.",
  },
  {
    question: "How much time does it take?",
    answer:
      "Around 10–12 hours a week for six weeks, including one live session in a shared window. The rest is asynchronous: tickets, pull requests, reviews, and written handoffs.",
  },
  {
    question: "Is it a job or an internship?",
    answer:
      "No. It is a training cohort, not employment, and it does not guarantee a job or visa sponsorship. What it gives you is shipped work and a team story you can explain in an interview.",
  },
  {
    question: "Will my work be public?",
    answer:
      "Yes. Contributions land in a public repository under its open-source licence, so do not join if you cannot share your work publicly.",
  },
];

export const metadata: Metadata = {
  title: "Cohort for Students & Recent Graduates | Yabloko Labs",
  description:
    "A six-week engineering cohort for final-year students and recent graduates worldwide. Three two-week sprints on a real codebase: tickets, reviewed pull requests, handoffs, and a release you can show in interviews.",
  keywords: [
    "Yabloko Labs cohort",
    "student cohort",
    "recent graduate program",
    "software engineering cohort",
    "open source internship alternative",
    "team programming practice",
    "code review practice",
    "portfolio project",
  ],
  alternates: {
    canonical: "https://yablokolabs.com/cohort",
  },
  openGraph: {
    type: "website",
    url: "https://yablokolabs.com/cohort",
    siteName: "Yabloko Labs",
    title: "Cohort for Students & Recent Graduates | Yabloko Labs",
    description:
      "Ship software with a team in six weeks. Three two-week sprints, reviewed pull requests, and a release you can show in interviews.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cohort for Students & Recent Graduates | Yabloko Labs",
    description:
      "Ship software with a team in six weeks. Register interest free — no CV needed at this stage.",
  },
};

const webPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://yablokolabs.com/cohort#webpage",
  url: "https://yablokolabs.com/cohort",
  name: "Cohort for Students & Recent Graduates | Yabloko Labs",
  description:
    "A six-week engineering cohort for final-year students and recent graduates, built around three two-week sprints on a real codebase.",
  inLanguage: "en",
  isPartOf: { "@id": "https://yablokolabs.com/#website" },
  about: { "@id": "https://yablokolabs.com/#organization" },
};

const courseJsonLd = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "Yabloko Labs Cohort — Ship Software With a Team",
  description:
    "A six-week engineering cohort for final-year students and recent graduates. Three two-week sprints on a real codebase covering tickets, pull requests, code review, role handoffs, testing, and a release.",
  url: "https://yablokolabs.com/cohort",
  inLanguage: "en",
  provider: {
    "@type": "Organization",
    name: "Yabloko Labs",
    sameAs: "https://yablokolabs.com",
  },
  hasCourseInstance: {
    "@type": "CourseInstance",
    courseMode: "online",
    courseWorkload: "PT10H",
    location: {
      "@type": "VirtualLocation",
      url: "https://yablokolabs.com/cohort",
    },
  },
};

export default function CohortPage() {
  return (
    <>
      <SiteNavigation subpage />
      <Breadcrumbs trail={[{ name: "Cohort", url: "https://yablokolabs.com/cohort" }]} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }} />

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
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Yabloko Labs Cohort · Interest open
          </div>
          <h1 className="hero-title">
            Ship Real Software With a Team in <span className="career-gradient">Six Weeks</span>
          </h1>
          <p className="hero-subtitle">
            A small engineering cohort for final-year students and recent graduates. Three two-week sprints on a real
            codebase: pick up tickets, review pull requests, manage handoffs, and ship a release you can show in an
            interview.
          </p>
          <div className="cta-buttons">
            <a href="#interest" className="btn btn-primary">
              Register Interest
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
            <a href="#program" className="btn btn-outline">
              How It Works
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
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v4l3 2" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      <section id="program" className="ai-section ai-section-muted">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">The Programme</span>
            <h2 className="section-title">Three Sprints, One Release</h2>
            <p className="section-subtitle">
              Six weeks, 6–8 people, one shared codebase. Everyone codes, everyone reviews, and everyone leads
              something for at least one sprint.
            </p>
          </div>

          <div className="career-steps">
            {sprints.map((sprint, index) => (
              <div key={sprint.title} className="career-step">
                <span className="career-step-number">{String(index + 1).padStart(2, "0")}</span>
                <h3>{sprint.title}</h3>
                <p>{sprint.copy}</p>
              </div>
            ))}
          </div>

          <div className="cohort-pills">
            {[
              "Sprint planning",
              "Git & pull requests",
              "Code review",
              "Role handoffs",
              "Testing",
              "Release",
              "Written communication",
            ].map((item) => (
              <span key={item} className="pill-chip">
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="who" className="ai-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Who It&apos;s For</span>
            <h2 className="section-title">Early Career, Real Team</h2>
            <p className="section-subtitle">
              This is not an introduction to programming. It is the team experience most people only get after their
              first job.
            </p>
          </div>

          <div className="career-role-card">
            <div className="career-role-head">
              <div>
                <span className="career-role-kicker">Cohort · 6–8 seats</span>
                <h3>Students and recent graduates worldwide</h3>
              </div>
              <span className="career-role-tag">Six weeks</span>
            </div>

            <div className="career-meta">
              {["Remote", "Worldwide", "One shared live window", "~10–12 hours/week"].map((item) => (
                <span key={item} className="pill-chip">
                  {item}
                </span>
              ))}
            </div>

            <div className="career-columns">
              <div>
                <h4>This is for you if you are</h4>
                <ul className="career-list">
                  {forYou.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4>What you need before you start</h4>
                <ul className="career-list">
                  {requirements.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="ai-section ai-section-muted">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">What You Leave With</span>
            <h2 className="section-title">Evidence You Can Point To</h2>
            <p className="section-subtitle">
              A certificate is only useful if it points at work. This one does.
            </p>
          </div>

          <div className="career-perks">
            {included.map((item) => (
              <div key={item.title} className="career-perk">
                <strong>{item.title}</strong>
                <span>{item.copy}</span>
              </div>
            ))}
          </div>

          <p className="cohort-note">
            The cohort is a paid pilot, not a job or internship. Registering interest is free; dates, the
            founding-cohort price, and refund terms go to the interest list before anyone pays. It does not guarantee
            employment or visa sponsorship.
          </p>
        </div>
      </section>

      <section id="interest" className="partnership-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Register Interest</span>
            <h2 className="section-title">Tell Us What You&apos;ve Built</h2>
            <p className="section-subtitle">
              A link and two lines is enough. No CV at this stage — we ask for one only if we move to a formal
              application.
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
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z" />
                </svg>
              </div>
              <h3>Join the Interest List</h3>
              <div className="partnership-details">
                <p>
                  We will email you with the project, the sprint dates, and the founding-cohort price before anyone
                  pays. If the dates do not work, you can say no.
                </p>

                <CohortInterestForm />

                <p className="partnership-note">
                  Prefer email? Write to <a href={`mailto:${COHORT_EMAIL}`}>{COHORT_EMAIL}</a> with the same details.
                  If you are looking for a job instead, see{" "}
                  <Link href="/careers">open roles at Yabloko Labs</Link>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="cohort-faq" className="ai-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">FAQ</span>
            <h2 className="section-title">Questions Before You Register</h2>
            <p className="section-subtitle">Straight answers about cost, time, and what this is not.</p>
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
