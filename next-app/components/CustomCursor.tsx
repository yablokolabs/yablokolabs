'use client';

import { useEffect, useState } from 'react';

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const moveCursor = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleHover = () => {
      const clickableElements = document.querySelectorAll(
        'a, button, [role="button"], .brand-card, .btn, [data-cursor-hover]'
      );
      
      const onMouseEnter = () => setIsHovering(true);
      const onMouseLeave = () => setIsHovering(false);
      
      clickableElements.forEach(el => {
        el.addEventListener('mouseenter', onMouseEnter);
        el.addEventListener('mouseleave', onMouseLeave);
      });

      return () => {
        clickableElements.forEach(el => {
          el.removeEventListener('mouseenter', onMouseEnter);
          el.removeEventListener('mouseleave', onMouseLeave);
        });
      };
    };

    window.addEventListener('mousemove', moveCursor);
    const cleanupHover = handleHover();

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      cleanupHover?.();
    };
  }, []);

  return (
    <>
      <style jsx global>{`
        * {
          cursor: none !important;
        }
      `}</style>
      
      {/* Main cursor dot */}
      <div 
        className={`cursor-dot ${isHovering ? 'hover' : ''}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      />
      
      {/* Outer ring */}
      <div 
        className={`cursor-outline ${isHovering ? 'hover' : ''}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      />
      
      {/* Pulse effect */}
      <div 
        className="cursor-pulse"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          opacity: isHovering ? 0.7 : 0.3,
        }}
      />
    </>
  );
}
