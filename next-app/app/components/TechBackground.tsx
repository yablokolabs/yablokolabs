'use client';

import { useEffect, useRef } from 'react';

export default function TechBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Elegant glowing orbs
    const orbs = Array.from({ length: 5 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 120 + 100,
      dx: (Math.random() - 0.5) * 0.25,
      dy: (Math.random() - 0.5) * 0.25,
      color: [
        'rgba(99,102,241,0.16)',
        'rgba(6,182,212,0.13)',
        'rgba(236,72,153,0.10)',
        'rgba(59,130,246,0.13)',
        'rgba(16,185,129,0.10)'
      ][Math.floor(Math.random() * 5)]
    }));

    // Animated lines
    const lines = Array.from({ length: 8 }).map(() => ({
      x1: Math.random() * canvas.width,
      y1: Math.random() * canvas.height,
      x2: Math.random() * canvas.width,
      y2: Math.random() * canvas.height,
      dx1: (Math.random() - 0.5) * 0.18,
      dy1: (Math.random() - 0.5) * 0.18,
      dx2: (Math.random() - 0.5) * 0.18,
      dy2: (Math.random() - 0.5) * 0.18,
      color: 'rgba(99,102,241,0.09)'
    }));

    // --- Sparkling Stars Setup ---
    // Brighter, more visible stars: mostly white/cyan, larger, more numerous
    const STAR_COLORS = [
      'rgba(255,255,255,0.98)', // white
      'rgba(255,255,255,0.98)', // white (repeat for higher probability)
      'rgba(255,255,255,0.98)', // white
      'rgba(6,182,212,0.96)',   // cyan
      'rgba(99,102,241,0.93)',  // indigo
      'rgba(139,92,246,0.92)',  // purple
      'rgba(236,72,153,0.90)'   // pink
    ];
    const NUM_STARS = Math.max(120, Math.floor((canvas.width * canvas.height) / 1200)); // More stars, min 120
    let stars = Array.from({ length: NUM_STARS }).map(() => {
      const baseAlpha = Math.random() * 0.45 + 0.55; // Brighter
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.35 + 0.7, // Bigger min/max radius
        color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
        twinkleSpeed: Math.random() * 0.012 + 0.013, // Slightly faster twinkle
        twinklePhase: Math.random() * Math.PI * 2,
        baseAlpha
      };
    });

    // Re-generate stars on resize
    const handleResize = () => {
      resizeCanvas();
      stars = Array.from({ length: Math.max(120, Math.floor((canvas.width * canvas.height) / 1200)) }).map(() => {
        const baseAlpha = Math.random() * 0.45 + 0.55;
        return {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * 1.35 + 0.7,
          color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
          twinkleSpeed: Math.random() * 0.012 + 0.013,
          twinklePhase: Math.random() * Math.PI * 2,
          baseAlpha
        };
      });
    };
    window.addEventListener('resize', handleResize);

    // --- Animation Loop ---
    let frame = 0;
    function animate() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw sparkling stars
      frame++;
      stars.forEach(star => {
        const twinkle = Math.sin(frame * star.twinkleSpeed + star.twinklePhase) * 0.4 + 0.6;
        ctx.save();
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, 2 * Math.PI);
        ctx.globalAlpha = star.baseAlpha * twinkle;
        ctx.fillStyle = star.color;
        ctx.shadowColor = star.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();
      });

      // Draw glowing orbs
      orbs.forEach(orb => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.r, 0, 2 * Math.PI);
        ctx.fillStyle = orb.color;
        ctx.shadowColor = orb.color.replace('0.', '0.3');
        ctx.shadowBlur = 90;
        ctx.fill();
        ctx.restore();
        orb.x += orb.dx;
        orb.y += orb.dy;
        // Bounce
        if (orb.x - orb.r < 0 || orb.x + orb.r > canvas.width) orb.dx *= -1;
        if (orb.y - orb.r < 0 || orb.y + orb.r > canvas.height) orb.dy *= -1;
      });
      // Draw animated lines
      lines.forEach(line => {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(line.x1, line.y1);
        ctx.lineTo(line.x2, line.y2);
        ctx.strokeStyle = line.color;
        ctx.lineWidth = 2;
        ctx.shadowColor = 'rgba(99,102,241,0.2)';
        ctx.shadowBlur = 6;
        ctx.stroke();
        ctx.restore();
        // Animate
        line.x1 += line.dx1; line.y1 += line.dy1;
        line.x2 += line.dx2; line.y2 += line.dy2;
        // Bounce
        if (line.x1 < 0 || line.x1 > canvas.width) line.dx1 *= -1;
        if (line.y1 < 0 || line.y1 > canvas.height) line.dy1 *= -1;
        if (line.x2 < 0 || line.x2 > canvas.width) line.dx2 *= -1;
        if (line.y2 < 0 || line.y2 > canvas.height) line.dy2 *= -1;
      });
      requestAnimationFrame(animate);
    }
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('resize', handleResize);
    };

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none"
      style={{ filter: 'blur(0.2px)', opacity: 1 }}
    />
  );
}

