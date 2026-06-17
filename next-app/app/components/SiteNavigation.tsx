"use client";

import Image from "next/image";
import Link from "next/link";

type SiteNavigationProps = {
  subpage?: boolean;
};

export default function SiteNavigation({ subpage = false }: SiteNavigationProps) {
  const sectionPrefix = subpage ? "/" : "";

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link href="/" className="logo">
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
      </div>
    </nav>
  );
}
