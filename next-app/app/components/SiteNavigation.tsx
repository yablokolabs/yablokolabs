"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

type SiteNavigationProps = {
  subpage?: boolean;
};

export default function SiteNavigation({ subpage = false }: SiteNavigationProps) {
  const sectionPrefix = subpage ? "/" : "";
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link href="/" className="logo" onClick={closeMenu}>
          <Image
            src="/assets/images/yablokolabs-logo-symbol.png"
            alt="Yabloko Labs Logo"
            width={40}
            height={40}
            className="logo-img logo-img-hover-spin"
            priority
          />
          <span className="logo-text">Yabloko Labs</span>
        </Link>
        <ul className="nav-links">
          <li className="nav-dropdown">
            <a href={`${sectionPrefix}#about`} className="nav-dropdown-toggle">
              About
            </a>
            <div className="nav-dropdown-menu">
              <a href={`${sectionPrefix}#about`}>Our Story</a>
              <Link href="/gender-equality-plan">Gender Equality Plan</Link>
            </div>
          </li>
          <li>
            <a href={`${sectionPrefix}#brands`}>Our Brands</a>
          </li>
          <li>
            <a href={`${sectionPrefix}#mcps`}>Our MCPs</a>
          </li>
          <li>
            <Link href="/ai-agents">AI Agents</Link>
          </li>
          <li>
            <Link href="/blog">Blog</Link>
          </li>
          <li>
            <a href={`${sectionPrefix}#partnership`} className="partnership-link">
              Partnership
              <span className="gem-badge" title="Earn 10% commission on successful referrals">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#FFD700" stroke="#D4AF37" strokeWidth="1.5">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
              </span>
            </a>
          </li>
          <li>
            <a href={`${sectionPrefix}#contact`}>Contact Us</a>
          </li>
        </ul>
        <button
          type="button"
          className={`nav-hamburger${menuOpen ? " open" : ""}`}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
      <div id="mobile-menu" className={`mobile-menu${menuOpen ? " open" : ""}`}>
        <a href={`${sectionPrefix}#about`} onClick={closeMenu}>
          About
        </a>
        <Link href="/gender-equality-plan" onClick={closeMenu}>
          Gender Equality Plan
        </Link>
        <a href={`${sectionPrefix}#brands`} onClick={closeMenu}>
          Our Brands
        </a>
        <a href={`${sectionPrefix}#mcps`} onClick={closeMenu}>
          Our MCPs
        </a>
        <Link href="/ai-agents" onClick={closeMenu}>
          AI Agents
        </Link>
        <Link href="/blog" onClick={closeMenu}>
          Blog
        </Link>
        <a href={`${sectionPrefix}#partnership`} onClick={closeMenu}>
          Partnership
        </a>
        <a href={`${sectionPrefix}#contact`} onClick={closeMenu}>
          Contact Us
        </a>
      </div>
    </nav>
  );
}
