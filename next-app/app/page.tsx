"use client";

import Image from 'next/image';

import { useEffect, useState } from 'react';

function StatCard({ icon, end, suffix, label, isInfinity = false }: { icon: React.ReactNode, end: number, suffix?: string, label: string, isInfinity?: boolean }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (isInfinity) return;
    const duration = 1100;
    const startTime = performance.now();
    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const value = Math.floor(progress * end);
      setCount(value);
      if (progress < 1) requestAnimationFrame(animate);
      else setCount(end);
    }
    requestAnimationFrame(animate);
    // eslint-disable-next-line
  }, [end]);
  return (
    <div className="stat-card glass animate-fade-in-up">
      <div className="stat-icon animate-float">{icon}</div>
      <span className="stat-number">
        {isInfinity ? '∞' : count}
        {suffix}
      </span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

import BackToTopButton from "./components/BackToTopButton";

export default function Home() {
  return (
    <>
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <a href="#" className="logo">
            <Image 
              src="/assets/images/logo.png" 
              alt="Yabloko Labs Logo" 
              width={40} 
              height={40}
              className="logo-img"
              priority
            />
            <span className="logo-text">Yabloko Labs</span>
          </a>
          <ul className="nav-links">
            <li><a href="#about">About</a></li>
            <li><a href="#brands">Our Brands</a></li>
            <li><a href="#contact">Contact Us</a></li>
          </ul>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
            <span className="hero-techicon hero-techicon-1" aria-hidden="true">
              {/* Gear Icon */}
              <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
                <g filter="url(#gear-glow)">
                  <path d="M10 6.5A3.5 3.5 0 1 1 6.5 10 3.5 3.5 0 0 1 10 6.5m8.5 3.5a1 1 0 0 0-.77-1l-1.07-.19a7.06 7.06 0 0 0-.46-1.11l.68-.93a1 1 0 0 0-.13-1.32l-1.06-1.06a1 1 0 0 0-1.32-.13l-.93.68a7.06 7.06 0 0 0-1.11-.46l-.19-1.07A1 1 0 0 0 10 1.5h-1.5a1 1 0 0 0-1 .77l-.19 1.07a7.06 7.06 0 0 0-1.11.46l-.93-.68a1 1 0 0 0-1.32.13L2.19 4.19a1 1 0 0 0-.13 1.32l.68.93a7.06 7.06 0 0 0-.46 1.11l-1.07.19A1 1 0 0 0 1.5 10v1.5a1 1 0 0 0 .77 1l1.07.19a7.06 7.06 0 0 0 .46 1.11l-.68.93a1 1 0 0 0 .13 1.32l1.06 1.06a1 1 0 0 0 1.32.13l.93-.68a7.06 7.06 0 0 0 1.11.46l.19 1.07a1 1 0 0 0 1 .77H10a1 1 0 0 0 1-.77l.19-1.07a7.06 7.06 0 0 0 1.11-.46l.93.68a1 1 0 0 0 1.32-.13l1.06-1.06a1 1 0 0 0 .13-1.32l-.68-.93a7.06 7.06 0 0 0 .46-1.11l1.07-.19a1 1 0 0 0 .77-1V10Z" stroke="#38bdf8" strokeWidth="1.2" fill="#0ea5e9"/>
                </g>
                <defs>
                  <filter id="gear-glow" x="0" y="0" width="20" height="20" filterUnits="userSpaceOnUse">
                    <feGaussianBlur stdDeviation="1.1"/>
                  </filter>
                </defs>
              </svg>
            </span>
            <span className="hero-techicon hero-techicon-2" aria-hidden="true">
              {/* Atom Icon */}
              <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
                <g filter="url(#atom-glow)">
                  <circle cx="10" cy="10" r="2.5" fill="#818cf8"/>
                  <ellipse cx="10" cy="10" rx="7" ry="2.8" stroke="#a5f3fc" strokeWidth="1.1"/>
                  <ellipse cx="10" cy="10" rx="2.8" ry="7" stroke="#a5f3fc" strokeWidth="1.1"/>
                  <ellipse cx="10" cy="10" rx="5.2" ry="5.2" stroke="#38bdf8" strokeWidth="0.8"/>
                </g>
                <defs>
                  <filter id="atom-glow" x="0" y="0" width="20" height="20" filterUnits="userSpaceOnUse">
                    <feGaussianBlur stdDeviation="1.1"/>
                  </filter>
                </defs>
              </svg>
            </span>
            Innovation at its Core
          </div>
            <h1 className="hero-title">
              Pioneering the <span className="quantum-gradient">Quantum</span> Future with
              <span className="block text-2xl mt-2 font-normal yl-gradient">Yabloko Labs</span>
            </h1>
            <style jsx>{`
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
              
              .yl-gradient {
                background: linear-gradient(-45deg, #3b82f6, #8b5cf6, #ec4899, #3b82f6);
                background-size: 300% 300%;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                text-fill-color: transparent;
                animation: gradientFlow 10s ease infinite;
              }
            `}</style>
            <p className="hero-subtitle">
              We&apos;re at the forefront of quantum computing and AI innovation, creating transformative solutions that solve tomorrow&apos;s most complex challenges. 
              Our quantum-powered technologies are redefining what&apos;s possible in business and beyond.
            </p>
          <div className="cta-buttons">
            <a href="#brands" className="btn btn-primary">
              Explore Our Brands
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
            <a href="#contact" className="btn btn-outline">
              Get In Touch
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section">
        <div className="container">
          <div className="about-content">
            <div className="about-text">
              <span className="section-badge">About Us</span>
              <h2 className="section-title">Quantum Innovation at Our Core</h2>
              <div className="about-description">
                <p>At Yabloko Labs, we&apos;re pioneering the quantum computing revolution. Founded in 2025, our mission is to harness the power of quantum computing to solve problems that were previously unsolvable.</p>
                <p>Our team of quantum physicists, computer scientists, and engineers are building the next generation of quantum algorithms and applications that will transform industries and push the boundaries of computational possibility.</p>
              </div>
              <div className="stats-grid">
  <StatCard icon={<svg width="32" height="32" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 14h9l-1 8 10-12h-9l1-8z"/></svg>} end={4} suffix="+" label="Innovative Brands" />
  <StatCard icon={<svg width="32" height="32" fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="16" cy="16" r="14"/><path d="M16 8v8l6 3"/></svg>} end={100} suffix="%" label="Dedication" />
  <StatCard icon={<svg width="32" height="32" fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 12a4 4 0 1 1 0 8a4 4 0 1 1 0-8z"/><path d="M12 16a4 4 0 1 1 8 0a4 4 0 1 1-8 0z"/></svg>} end={9999} isInfinity label="Possibilities" />
</div>
            </div>
            
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <section id="brands" className="brands-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Our Portfolio</span>
            <h2 className="section-title">Innovative Ventures</h2>
            <p className="section-subtitle">
              Discover our growing family of brands that are pushing the boundaries of technology and innovation
            </p>
          </div>
          
          <div className="brands-grid">
            <div className="brand-card">
              <div className="brand-logo">
                <Image 
                  src="/assets/images/logo_map2map.png" 
                  alt="Map2Map" 
                  width={120} 
                  height={120}
                  className="brand-logo-img"
                />
              </div>
              <h3 className="brand-title">Map2Map<sup style={{fontSize:'0.7em',marginLeft:'2px'}}>&trade;</sup></h3>
              <p className="brand-description">
                Expert Google Maps management services to enhance your business&apos;s online presence and local search visibility. We optimize and manage your Google Business Profile for maximum impact.
              </p>
              <a href="https://map2map.com" className="brand-link" target="_blank" rel="noopener noreferrer">
                Explore Map2Map<sup style={{fontSize:'0.7em',marginLeft:'2px'}}>&trade;</sup>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
            </div>

            <div className="brand-card">
              <div className="brand-logo">
                <Image 
                  src="/assets/images/logo_aiponatime.png" 
                  alt="AIponATime" 
                  width={120} 
                  height={120}
                  className="brand-logo-img"
                />
              </div>
              <h3 className="brand-title">AIponATime<sup style={{fontSize:'0.7em',marginLeft:'2px'}}>&trade;</sup></h3>
              <p className="brand-description">
                Where artificial intelligence meets creative storytelling to bring your imagination to life.
                <br />
                It sparks a child to be a success, nurturing curiosity and empowering dreams with every story.
              </p>
              <a href="https://www.aiponatime.com" className="brand-link" target="_blank" rel="noopener noreferrer">
                Discover AIponATime<sup style={{fontSize:'0.7em',marginLeft:'2px'}}>&trade;</sup>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
            </div>

            <div className="brand-card">
              <div className="brand-logo">
                  <Image 
                    src="/assets/images/logo_q-router.png" 
                    alt="Q-Router" 
                    width={120} 
                    height={120}
                    className="brand-logo-img"
                  />
                </div>
              <h3 className="brand-title">Q-Router<sup style={{fontSize:'0.7em',marginLeft:'2px'}}>&trade;</sup></h3>
              <p className="brand-description">
                Quantum-enhanced delivery route optimization with AI traffic prediction to find the fastest, most cost-efficient paths, reducing CPA for logistics and 10-minute delivery apps.
              </p>
              <a href="https://q-router.com" className="brand-link" target="_blank" rel="noopener noreferrer">
                Discover Q-Router<sup style={{fontSize:'0.7em',marginLeft:'2px'}}>&trade;</sup>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
            </div>

            <div className="brand-card">
              <div className="brand-logo">
                <div className="brand-logo-placeholder" style={{ width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5', borderRadius: '50%' }}>
                  <span style={{ fontSize: '24px', color: '#666' }}>Q-A</span>
                </div>
              </div>
              <h3 className="brand-title">Q-Admix<sup style={{fontSize:'0.7em',marginLeft:'2px'}}>&trade;</sup></h3>
              <p className="brand-description">
                Hybrid quantum-classical AI for ad spend optimization, blending quantum algorithms with AI to boost ROAS through precision targeting, peak efficiency, and measurable growth.
              </p>
              <a href="https://q-admix.com" className="brand-link" target="_blank" rel="noopener noreferrer">
                Explore Q-Admix<sup style={{fontSize:'0.7em',marginLeft:'2px'}}>&trade;</sup>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>


      {/* Social Section */}
      <section id="contact" className="social-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Stay Connected</span>
            <h2 className="section-title" style={{ color: '#23264d', background: 'none', WebkitBackgroundClip: 'unset', WebkitTextFillColor: 'unset', textShadow: 'none' }}>Connect With Us</h2>
            <p className="section-subtitle">
              Follow our journey and stay updated with our latest innovations and breakthrough technologies
            </p>
            <div style={{ marginTop: '10px', padding: '10px', background: '#f1f3fa', borderRadius: '8px', display: 'inline-block', boxShadow: '0 1px 6px rgba(35,38,77,0.07)' }}>
              <span style={{ fontWeight: 'bold', color: '#23264d', marginRight: '16px' }}>
                📧 <a href="mailto:support@yablokolabs.com" style={{ color: '#3a5be0', textDecoration: 'underline' }}>support@yablokolabs.com</a>
              </span>
              <span style={{ fontWeight: 'bold', color: '#23264d' }}>
                📱 <a href="tel:+919538351398" style={{ color: '#3a5be0', textDecoration: 'underline' }}>+91 95383 51398</a>
              </span>
            </div>
          </div>
          
          <div className="social-links">
            <a href="https://www.linkedin.com/in/yabloko-labs-4858bb366/" className="social-link" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            
            <a href="https://github.com/yablokolabs" className="social-link" aria-label="GitHub" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
            
            <a href="https://www.instagram.com/yabloko_labs/" className="social-link" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            
            <a href="https://www.facebook.com/people/yablokolabs/61578265855070" className="social-link" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            
            <a href="https://www.youtube.com/@map2map" className="social-link" aria-label="YouTube" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontWeight: 700, fontSize: '1.25rem', letterSpacing: '0.02em', background: 'linear-gradient(90deg, #fff 0%, #a5b4fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Yabloko Labs</span>
            <Image
              src="/assets/images/logo.png"
              alt="Yabloko Labs"
              width={54}
              height={54}
              className="about-logo"
              style={{ color: 'transparent', marginTop: '0.25rem' }}
              loading="lazy"
              decoding="async"
            />
          </div>
          <p className="footer-description">
            Pioneering innovative technology solutions that transform businesses and shape the digital future. 
            Building tomorrow&apos;s technology today.
          </p>
          
          <div className="footer-divider"></div>
          
          <div className="footer-bottom">
            <div className="copyright text-center">
              © 2025 Yabloko Labs Pvt. Ltd. All rights reserved
            </div>
            <div className="legal-info text-center">
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