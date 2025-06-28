"use client";

import { useEffect } from 'react';
import Image from 'next/image';



export function Gradient() {
  useEffect(() => {
    const canvas = document.getElementById('gradient-canvas') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Create more points for a richer animation
    const points = [];
    for (let i = 0; i < 6; i++) {
      points.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 6.0,
        vy: (Math.random() - 0.5) * 6.0,
        radius: Math.random() * 300 + 200
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Update points
      points.forEach(point => {
        point.x += point.vx;
        point.y += point.vy;

        // Bounce off edges with padding
        if (point.x < -100 || point.x > width + 100) point.vx *= -1;
        if (point.y < -100 || point.y > height + 100) point.vy *= -1;
      });

      // Create multiple overlapping gradients
      points.forEach((point, index) => {
        const gradient = ctx.createRadialGradient(
          point.x, point.y, 0,
          point.x, point.y, point.radius
        );

        // Create different color combinations for each point
        const colors = [
          ['#003B5C', '#0077b6', '#003B5C'],
          ['#0077b6', '#003B5C', '#0077b6'],
          ['#003B5C', '#0077b6', '#003B5C'],
          ['#0077b6', '#003B5C', '#0077b6'],
          ['#003B5C', '#0077b6', '#003B5C'],
          ['#0077b6', '#003B5C', '#0077b6']
        ];

        gradient.addColorStop(0, colors[index][0]);
        gradient.addColorStop(0.5, colors[index][1]);
        gradient.addColorStop(1, colors[index][2]);

        ctx.globalAlpha = 0.3;
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      });

      ctx.globalAlpha = 1.0;
      requestAnimationFrame(animate);
    };

    animate();

    const resizeHandler = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', resizeHandler);

    return () => {
      window.removeEventListener('resize', resizeHandler);
      ctx.clearRect(0, 0, width, height);
    };
  }, []);

  return null;
}

export default function Home() {
  return (
    <>
      <canvas id="gradient-canvas" />
      <main>
        <h1>Welcome to Yabloko Labs!</h1>
        <p>We&apos;re glad you&apos;re here. Explore our projects and innovations!</p>
        <p className="brand-text">Our first flagship venture: <span className="brand-name">Map2Map™</span></p>
        <div className="brand-container">
          <Image src="/assets/images/logo_map2map.png" alt="Map2Map Logo" className="brand-logo" width={250} height={150} />
          <a href="https://map2map.com" className="brand-link">Visit our brand website</a>
        </div>
        
        <p className="brand-text brand-section-gap">Our newest venture: <span className="brand-name">AIponATime™</span></p>
        <div className="brand-container">
          <Image src="/assets/images/logo_aiponatime.png" alt="AIponATime Logo" className="brand-logo" width={250} height={150} />
          <a href="https://www.aiponatime.com" className="brand-link">Visit our brand website</a>
        </div>
      </main>

      <div className="social-links">
        <a href="https://www.linkedin.com/in/map2map-yabloko-labs-6b9157364/" className="linkedin" aria-label="LinkedIn" target="_blank" rel="noopener"></a>
        <a href="https://github.com/map2map" className="github" aria-label="GitHub" target="_blank" rel="noopener"></a>
        <a href="https://www.instagram.com/yablokolabs?igsh=ODBncnA4a3prNGFt" className="instagram" aria-label="Instagram" target="_blank" rel="noopener"></a>
        <a href="https://www.facebook.com/profile.php?id=61577028394576" className="facebook" aria-label="Facebook" target="_blank" rel="noopener"></a>
        <a href="https://www.youtube.com/@map2map" className="youtube" aria-label="YouTube" target="_blank" rel="_noopener"></a>
      </div>

      <footer className="site-footer">
        <div className="footer-content">
          <div className="copyright"> 2025 Yabloko Labs Pvt. Ltd. All rights reserved</div>
          <div className="legal-info">
            <span className="legal-item">CIN: U62011KA2025PTC201171</span>
            <span className="legal-item">MSME: UDYAM-KR-03-0533847</span>
            <span className="legal-item">DPIIT: DIPP209889</span>
          </div>
        </div>
      </footer>
    </>
  );
}
