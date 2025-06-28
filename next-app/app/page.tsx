"use client";

import Image from 'next/image';

export default function Home() {
  return (
    <>
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <a href="#" className="logo">
            <div className="logo-icon">Y</div>
            Yabloko Labs
          </a>
          <ul className="nav-links">
            <li><a href="#about">About</a></li>
            <li><a href="#brands">Brands</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
            Innovation at its Core
          </div>
          <h1 className="hero-title">
            Welcome to<br />
            <span className="text-gradient">Yabloko Labs</span>
          </h1>
          <p className="hero-subtitle">
            Pioneering cutting-edge technology solutions that transform businesses and shape the digital future. 
            We build innovative products that make a meaningful impact in the world.
          </p>
          <div className="cta-buttons">
            <a href="#brands" className="btn btn-primary">
              Explore Our Brands
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 17L17 7M17 7H7M17 7V17"/>
              </svg>
            </a>
            <a href="#contact" className="btn btn-outline">
              Get In Touch
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Features/Brands Section */}
      <section id="brands" className="features-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Our Portfolio</span>
            <h2 className="section-title">Revolutionary Brands</h2>
            <p className="section-subtitle">
              Discover our flagship ventures that are transforming their respective industries with innovative technology solutions
            </p>
          </div>
          
          <div className="features-grid">
            <div className="feature-card animate-fade-in-up">
              <div className="feature-icon">
                <Image 
                  src="/assets/images/logo_map2map.png" 
                  alt="Map2Map Logo" 
                  width={40} 
                  height={40}
                  style={{ filter: 'brightness(0) invert(1)' }}
                />
              </div>
              <h3 className="feature-title">Map2Map™</h3>
              <p className="feature-description">
                Revolutionary mapping and navigation solutions that redefine how we interact with spatial data and location-based services. Advanced geospatial technology for the modern world.
              </p>
              <a href="https://map2map.com" className="feature-link" target="_blank" rel="noopener noreferrer">
                Visit Website
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
                </svg>
              </a>
            </div>

            <div className="feature-card animate-fade-in-up">
              <div className="feature-icon">
                <Image 
                  src="/assets/images/logo_aiponatime.png" 
                  alt="AIponATime Logo" 
                  width={40} 
                  height={40}
                  style={{ filter: 'brightness(0) invert(1)' }}
                />
              </div>
              <h3 className="feature-title">AIponATime™</h3>
              <p className="feature-description">
                Next-generation AI-powered storytelling platform that brings imagination to life through intelligent narrative generation. Where artificial intelligence meets creative storytelling.
              </p>
              <a href="https://www.aiponatime.com" className="feature-link" target="_blank" rel="noopener noreferrer">
                Visit Website
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Our Impact</span>
            <h2 className="section-title">By the Numbers</h2>
          </div>
          <div className="stats-grid">
            <div className="stat-item animate-fade-in-up">
              <span className="stat-number">2+</span>
              <span className="stat-label">Active Brands</span>
            </div>
            <div className="stat-item animate-fade-in-up">
              <span className="stat-number">2025</span>
              <span className="stat-label">Founded</span>
            </div>
            <div className="stat-item animate-fade-in-up">
              <span className="stat-number">∞</span>
              <span className="stat-label">Possibilities</span>
            </div>
            <div className="stat-item animate-fade-in-up">
              <span className="stat-number">100%</span>
              <span className="stat-label">Innovation</span>
            </div>
          </div>
        </div>
      </section>

      {/* Social Section */}
      <section id="contact" className="social-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Stay Connected</span>
            <h2 className="section-title">Connect With Us</h2>
            <p className="section-subtitle">
              Follow our journey and stay updated with our latest innovations and breakthrough technologies
            </p>
          </div>
          
          <div className="social-links">
            <a href="https://www.linkedin.com/in/map2map-yabloko-labs-6b9157364/" className="social-link" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            
            <a href="https://github.com/map2map" className="social-link" aria-label="GitHub" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
            
            <a href="https://www.instagram.com/yablokolabs?igsh=ODBncnA4a3prNGFt" className="social-link" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            
            <a href="https://www.facebook.com/profile.php?id=61577028394576" className="social-link" aria-label="Facebook" target="_blank" rel="noopener noreferrer">
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
          <div className="footer-logo">
            <div className="footer-logo-icon">Y</div>
            Yabloko Labs
          </div>
          <p className="footer-description">
            Pioneering innovative technology solutions that transform businesses and shape the digital future. 
            Building tomorrow's technology today.
          </p>
          
          <div className="footer-divider"></div>
          
          <div className="footer-bottom">
            <div className="copyright">
              © 2025 Yabloko Labs Pvt. Ltd. All rights reserved
            </div>
            <div className="legal-info">
              <span className="legal-item">CIN: U62011KA2025PTC201171</span>
              <span className="legal-item">MSME: UDYAM-KR-03-0533847</span>
              <span className="legal-item">DPIIT: DIPP209889</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}