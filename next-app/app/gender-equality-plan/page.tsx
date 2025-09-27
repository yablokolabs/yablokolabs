"use client";

import Image from "next/image";
import Link from "next/link";
import BackToTopButton from "../components/BackToTopButton";

export default function GenderEqualityPlan() {
  return (
    <>
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <Link href="/" className="logo">
            <Image
              src="/assets/images/yablokolabs-logo-symbol.png"
              alt="Yabloko Labs Logo"
              width={40}
              height={40}
              className="logo-img"
              style={{ transition: "transform 0.5s ease-in-out" }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "rotate(360deg)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "rotate(0deg)"}
              priority
            />
            <span className="logo-text">Yabloko Labs</span>
          </Link>
          <ul className="nav-links">
            <li>
              <Link href="/#about">About</Link>
            </li>
            <li>
              <Link href="/#brands">Our Brands</Link>
            </li>
            <li>
              <Link href="/#partnership" className="partnership-link">
                Partnership
                <span className="gem-badge" title="Earn 10% commission on successful referrals">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#FFD700" stroke="#D4AF37" strokeWidth="1.5">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                </span>
              </Link>
            </li>
            <li>
              <Link href="/#contact">Contact Us</Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
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
              <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
              <path d="M9 12l2 2 4-4" />
            </svg>
            Equality & Inclusion
          </div>
          <h1 className="hero-title">
            Gender <span className="quantum-gradient">Equality</span> Plan
          </h1>
          <style jsx>
            {`
            @keyframes gradientFlow {
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }
            
            .quantum-gradient {
              background: linear-gradient(-45deg, #60a5fa, #a78bfa, #f472b6, #60a5fa);
              background-size: 300% 300%;
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
              text-fill-color: transparent;
              animation: gradientFlow 8s ease infinite;
            }
          `}
          </style>
          <p className="hero-subtitle">
            At Yabloko Labs, we are committed to fostering an inclusive workplace where all individuals, regardless of
            gender, have equal opportunities to thrive, innovate, and contribute to our quantum computing revolution.
          </p>
          <div className="cta-buttons">
            <button
              onClick={() => window.print()}
              className="btn btn-primary"
              title="Print this page as PDF using your browser's print function"
            >
              Print as PDF
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
                <polyline points="6,9 6,2 18,2 18,9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" />
                <polyline points="6,14 6,22 18,22 18,14" />
              </svg>
            </button>
            <a
              href="/assets/documents/gender-equality-plan-printable.html"
              className="btn btn-outline"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Printable Version
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
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15,3 21,3 21,9" />
                <line x1="10" x2="21" y1="14" y2="3" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section id="introduction" className="about-section">
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <span className="section-badge">Our Commitment</span>
              <h2 className="section-title">Leadership Statement</h2>
              <div className="about-description">
                <div
                  style={{
                    background: "rgba(99, 102, 241, 0.1)",
                    borderLeft: "4px solid #6366f1",
                    padding: "2rem",
                    borderRadius: "0.5rem",
                    marginBottom: "2rem",
                  }}
                >
                  <p
                    style={{
                      fontStyle: "italic",
                      fontSize: "1.125rem",
                      lineHeight: "1.7",
                      color: "#e2e8f0",
                      margin: 0,
                    }}
                  >
                    &ldquo;At Yabloko Labs, we believe that diversity of thought, experience, and perspective drives
                    innovation. Gender equality is not just a moral imperative&mdash;it&rsquo;s a business necessity
                    that fuels our ability to solve complex quantum computing challenges and create transformative
                    solutions for the future.&rdquo;
                  </p>
                  <p style={{ marginTop: "1rem", fontSize: "1rem", color: "#a5b4fc", margin: "1rem 0 0 0" }}>
                    — <strong>CEO, Yabloko Labs</strong>
                  </p>
                </div>

                <p>
                  This Gender Equality Plan outlines our comprehensive approach to creating and maintaining an inclusive
                  workplace where all team members can reach their full potential. We are committed to transparency,
                  accountability, and continuous improvement in our pursuit of gender equality across all aspects of our
                  organization.
                </p>

                <p>
                  As a technology company operating in the quantum computing space, we recognize that our industry has
                  historically faced challenges with gender representation. We are determined to be part of the solution
                  by implementing evidence-based strategies that promote equality and create lasting positive change.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Elements Section */}
      <section id="core-elements" className="brands-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Horizon Requirements</span>
            <h2 className="section-title">Essential Elements</h2>
            <p className="section-subtitle">
              Our Gender Equality Plan addresses all mandatory elements required by Horizon Europe funding guidelines
            </p>
          </div>

          <div className="brands-grid">
            <div className="brand-card">
              <div className="brand-logo">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14,2 14,8 20,8" />
                  <line x1="16" x2="8" y1="13" y2="13" />
                  <line x1="16" x2="8" y1="17" y2="17" />
                  <polyline points="10,9 9,9 8,9" />
                </svg>
              </div>
              <h3 className="brand-title">Publication & Transparency</h3>
              <p className="brand-description">
                This plan is publicly available on our website and has been formally signed by our leadership team,
                demonstrating our commitment to transparency and accountability.
              </p>
            </div>

            <div className="brand-card">
              <div className="brand-logo">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 1v6m0 6v6" />
                  <path d="m15.5 14.5 3.5 3.5-3.5-3.5 3.5-3.5-3.5 3.5" />
                  <path d="m8.5 14.5-3.5 3.5 3.5-3.5-3.5-3.5 3.5 3.5" />
                </svg>
              </div>
              <h3 className="brand-title">Dedicated Resources</h3>
              <p className="brand-description">
                We have allocated specific human and financial resources to support gender equality initiatives,
                including dedicated personnel and budget for training, programs, and monitoring activities.
              </p>
            </div>

            <div className="brand-card">
              <div className="brand-logo">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 3v18h18" />
                  <path d="M18 17V9" />
                  <path d="M13 17V5" />
                  <path d="M8 17v-3" />
                </svg>
              </div>
              <h3 className="brand-title">Data Collection & Monitoring</h3>
              <p className="brand-description">
                We systematically collect and analyze gender-disaggregated data across recruitment, promotion,
                leadership representation, and compensation to track progress and identify areas for improvement.
              </p>
            </div>

            <div className="brand-card">
              <div className="brand-logo">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                  <path d="M9 14l2 2 4-4" />
                </svg>
              </div>
              <h3 className="brand-title">Training & Awareness</h3>
              <p className="brand-description">
                Regular training programs on unconscious bias, inclusive leadership, and gender equality are mandatory
                for all employees, with specialized sessions for managers and recruitment teams.
              </p>
            </div>

            <div className="brand-card">
              <div className="brand-logo">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 12h.01" />
                  <path d="M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                  <path d="M22 13a18.15 18.15 0 0 1-20 0" />
                  <rect width="20" height="14" x="2" y="6" rx="2" />
                </svg>
              </div>
              <h3 className="brand-title">Work-Life Balance</h3>
              <p className="brand-description">
                Flexible working arrangements, parental leave policies, and support for caregiving responsibilities
                ensure all employees can balance professional and personal commitments effectively.
              </p>
            </div>

            <div className="brand-card">
              <div className="brand-logo">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 className="brand-title">Leadership & Progression</h3>
              <p className="brand-description">
                Clear pathways for career advancement, mentorship programs, and targets for gender representation in
                leadership positions ensure equal opportunities for professional growth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Implementation Plan Section */}
      <section id="implementation" className="partnership-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Action Plan</span>
            <h2 className="section-title">Implementation Timeline</h2>
            <p className="section-subtitle">
              Our structured approach to implementing gender equality initiatives with clear timelines and
              responsibilities
            </p>
          </div>

          <div className="implementation-timeline">
            <div className="timeline-section">
              <h3 style={{ color: "#6366f1", fontSize: "1.5rem", marginBottom: "1.5rem" }}>
                Short-term Actions (0-6 months)
              </h3>
              <div className="timeline-grid">
                <div className="timeline-item">
                  <div className="timeline-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
                    </svg>
                  </div>
                  <div className="timeline-content">
                    <h4>Policy Review & Update</h4>
                    <p>
                      Comprehensive review of all HR policies to ensure gender-neutral language and inclusive practices.
                    </p>
                    <span className="timeline-responsible">Responsible: HR Team & Leadership</span>
                  </div>
                </div>

                <div className="timeline-item">
                  <div className="timeline-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                    </svg>
                  </div>
                  <div className="timeline-content">
                    <h4>Baseline Data Collection</h4>
                    <p>
                      Establish comprehensive data collection systems for gender representation across all departments
                      and levels.
                    </p>
                    <span className="timeline-responsible">Responsible: Data Analytics Team</span>
                  </div>
                </div>

                <div className="timeline-item">
                  <div className="timeline-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    </svg>
                  </div>
                  <div className="timeline-content">
                    <h4>Initial Training Rollout</h4>
                    <p>Launch mandatory unconscious bias training for all managers and recruitment personnel.</p>
                    <span className="timeline-responsible">Responsible: Learning & Development</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="timeline-section">
              <h3 style={{ color: "#06b6d4", fontSize: "1.5rem", marginBottom: "1.5rem" }}>
                Medium-term Actions (6-12 months)
              </h3>
              <div className="timeline-grid">
                <div className="timeline-item">
                  <div className="timeline-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    </svg>
                  </div>
                  <div className="timeline-content">
                    <h4>Mentorship Program Launch</h4>
                    <p>
                      Implement structured mentorship and sponsorship programs to support career advancement for all
                      genders.
                    </p>
                    <span className="timeline-responsible">Responsible: Talent Development Team</span>
                  </div>
                </div>

                <div className="timeline-item">
                  <div className="timeline-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 3v18h18" />
                    </svg>
                  </div>
                  <div className="timeline-content">
                    <h4>Pay Equity Analysis</h4>
                    <p>Conduct comprehensive pay equity analysis and address any identified disparities.</p>
                    <span className="timeline-responsible">Responsible: Compensation Team & External Auditors</span>
                  </div>
                </div>

                <div className="timeline-item">
                  <div className="timeline-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 12h.01" />
                    </svg>
                  </div>
                  <div className="timeline-content">
                    <h4>Flexible Work Expansion</h4>
                    <p>
                      Expand flexible working options and implement family-friendly policies including enhanced parental
                      leave.
                    </p>
                    <span className="timeline-responsible">Responsible: Operations & HR Team</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Review & Updates Section */}
      <section id="review" className="social-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Continuous Improvement</span>
            <h2
              className="section-title"
              style={{
                color: "#23264d",
                background: "none",
                WebkitBackgroundClip: "unset",
                WebkitTextFillColor: "unset",
                textShadow: "none",
              }}
            >
              Review & Updates
            </h2>
            <p className="section-subtitle">
              Our commitment to continuous improvement through regular monitoring, evaluation, and plan updates
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "2rem",
              marginTop: "3rem",
            }}
          >
            <div
              style={{
                background: "rgba(99, 102, 241, 0.1)",
                padding: "2rem",
                borderRadius: "1rem",
                border: "1px solid rgba(99, 102, 241, 0.2)",
                textAlign: "left",
              }}
            >
              <h3 style={{ color: "#6366f1", marginBottom: "1rem" }}>Annual Review Process</h3>
              <ul style={{ color: "#000000 !important", lineHeight: "1.6" }}>
                <li style={{ color: "#000000 !important" }}>Comprehensive data analysis and progress assessment</li>
                <li style={{ color: "#000000 !important" }}>Stakeholder feedback collection from all employees</li>
                <li style={{ color: "#000000 !important" }}>External benchmarking against industry standards</li>
                <li style={{ color: "#000000 !important" }}>Leadership review and strategic planning session</li>
              </ul>
            </div>

            <div
              style={{
                background: "rgba(6, 182, 212, 0.1)",
                padding: "2rem",
                borderRadius: "1rem",
                border: "1px solid rgba(6, 182, 212, 0.2)",
                textAlign: "left",
              }}
            >
              <h3 style={{ color: "#06b6d4", marginBottom: "1rem" }}>Update Methodology</h3>
              <ul style={{ color: "#000000 !important", lineHeight: "1.6" }}>
                <li style={{ color: "#000000 !important" }}>Evidence-based adjustments to policies and practices</li>
                <li style={{ color: "#000000 !important" }}>Integration of latest research and best practices</li>
                <li style={{ color: "#000000 !important" }}>Consultation with gender equality experts</li>
                <li style={{ color: "#000000 !important" }}>
                  Transparent communication of changes to all stakeholders
                </li>
              </ul>
            </div>

            <div
              style={{
                background: "rgba(139, 92, 246, 0.1)",
                padding: "2rem",
                borderRadius: "1rem",
                border: "1px solid rgba(139, 92, 246, 0.2)",
                textAlign: "left",
              }}
            >
              <h3 style={{ color: "#8b5cf6", marginBottom: "1rem" }}>Accountability Measures</h3>
              <ul style={{ color: "#000000 !important", lineHeight: "1.6" }}>
                <li style={{ color: "#000000 !important" }}>Quarterly progress reports to leadership team</li>
                <li style={{ color: "#000000 !important" }}>Public annual gender equality report publication</li>
                <li style={{ color: "#000000 !important" }}>Integration of equality metrics in performance reviews</li>
                <li style={{ color: "#000000 !important" }}>Regular employee surveys and feedback mechanisms</li>
              </ul>
            </div>
          </div>

          <div style={{ marginTop: "3rem", textAlign: "center" }}>
            <div
              style={{
                background: "rgba(16, 185, 129, 0.1)",
                border: "2px solid rgba(16, 185, 129, 0.3)",
                borderRadius: "1rem",
                padding: "2rem",
                maxWidth: "600px",
                margin: "0 auto",
              }}
            >
              <h3 style={{ color: "#10b981", marginBottom: "1rem" }}>Next Review Date</h3>
              <p style={{ color: "#000000", fontSize: "1.125rem", margin: 0 }}>
                This Gender Equality Plan will be comprehensively reviewed and updated by{" "}
                <strong>December 2025</strong>, with interim assessments conducted quarterly to ensure we remain on
                track with our commitments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact-gep" className="about-section">
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <span className="section-badge">Get Involved</span>
              <h2 className="section-title">Questions & Feedback</h2>
              <div className="about-description">
                <p>
                  We welcome questions, suggestions, and feedback about our Gender Equality Plan. Your input is valuable
                  in helping us create a more inclusive and equitable workplace for everyone.
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: "1rem",
                    marginTop: "2rem",
                    flexWrap: "wrap",
                    justifyContent: "center",
                  }}
                >
                  <a
                    href="mailto:ceo@yablokolabs.com?subject=Gender%20Equality%20Plan%20Inquiry"
                    className="btn btn-primary"
                  >
                    Contact Leadership
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
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </a>
                  <Link href="/" className="btn btn-outline">
                    Return to Home
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
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9,22 9,12 15,12 15,22" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div
            className="footer-logo"
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}
          >
            <span
              style={{
                fontWeight: 700,
                fontSize: "1.25rem",
                letterSpacing: "0.02em",
                background: "linear-gradient(90deg, #fff 0%, #a5b4fc 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Yabloko Labs
            </span>
            <Image
              src="/assets/images/yablokolabs-logo-symbol.png"
              alt="Yabloko Labs"
              width={54}
              height={54}
              className="about-logo"
              style={{
                color: "transparent",
                marginTop: "0.25rem",
                transition: "transform 0.5s ease-in-out",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "rotate(360deg)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "rotate(0deg)"}
              loading="lazy"
              decoding="async"
            />
          </div>
          <p className="footer-description">
            Pioneering innovative technology solutions that transform businesses and shape the digital future. Building
            tomorrow&apos;s technology today.
          </p>

          <div className="footer-divider"></div>

          <div className="footer-bottom">
            <div className="text-center" style={{ marginBottom: "20px" }}>
              <p
                style={{
                  fontSize: "14px",
                  fontFamily: "Arial, sans-serif",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  background: "linear-gradient(90deg, var(--primary-dark), var(--accent))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  fontWeight: 500,
                }}
              >
                <span className="rocket-emoji">🚀</span>
                Yabloko Labs is <span style={{ fontWeight: "bold" }}>Crafting Hybrid AI-Quantum SaaS that Scales</span>
              </p>
            </div>
            <div className="copyright text-center">
              © 2025 Yabloko Labs Ltd. All rights reserved <br></br>
              <a
                href="https://maps.app.goo.gl/L6vq5D8wfC3n4nt36"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline underline-offset-4"
              >
                71-75 Shelton Street, Covent Garden, London, WC2H 9JQ
              </a>
            </div>
            <div className="legal-info text-center">
              <span className="legal-item">CRN: 16660148</span>
              <span className="legal-item">CIN: U62011KA2025PTC201171</span>
              <span className="legal-item">MSME: UDYAM-KR-03-0533847</span>
              <span className="legal-item">DPIIT: DIPP209889</span>
              <span className="legal-item">GSTIN: 29AABCY9947J1ZG</span>
            </div>
          </div>
        </div>
      </footer>

      <BackToTopButton />
    </>
  );
}
