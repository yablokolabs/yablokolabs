"use client";

import Image from "next/image";
import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-logo footer-logo-stack">
          <span className="footer-brand-text">Yabloko Labs</span>
          <Image
            src="/assets/images/yablokolabs-logo-symbol.png"
            alt="Yabloko Labs"
            width={54}
            height={54}
            className="about-logo logo-img-hover-spin"
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
          <div className="text-center footer-tagline">
            <p className="footer-tagline-text">
              <span className="rocket-emoji">🚀</span>
              Yabloko Labs is <span className="footer-tagline-strong">Crafting Hybrid AI-Quantum SaaS that Scales</span>
            </p>
          </div>
          <div className="copyright text-center">
            © 2025-2026 Yabloko Labs Ltd. All rights reserved <br />
            <a
              href="https://maps.app.goo.gl/L6vq5D8wfC3n4nt36"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline underline-offset-4"
            >
              71-75 Shelton Street, Covent Garden, London, WC2H 9JQ
            </a>
            <br />
            <div className="footer-utility-links">
              <Link href="/ai-agents" className="footer-utility-link">
                AI Agents
              </Link>
              <Link href="/gender-equality-plan" className="footer-utility-link">
                Gender Equality Plan
              </Link>
              <a href="mailto:support@yablokolabs.com" className="footer-utility-link">
                Contact
              </a>
            </div>
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
  );
}
