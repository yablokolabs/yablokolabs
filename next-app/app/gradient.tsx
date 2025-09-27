"use client";
import { useEffect, useRef } from "react";

interface Point {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

export function Gradient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Create more points for a richer animation
    const points: Point[] = [];
    for (let i = 0; i < 6; i++) {
      points.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 6.0,
        vy: (Math.random() - 0.5) * 6.0,
        radius: Math.random() * 300 + 200,
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
          point.x,
          point.y,
          0,
          point.x,
          point.y,
          point.radius,
        );

        // Create different color combinations for each point
        const colors = [
          ["#003B5C", "#0077b6", "#003B5C"],
          ["#0077b6", "#003B5C", "#0077b6"],
          ["#003B5C", "#0077b6", "#003B5C"],
          ["#0077b6", "#003B5C", "#0077b6"],
          ["#003B5C", "#0077b6", "#003B5C"],
          ["#0077b6", "#003B5C", "#0077b6"],
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

    window.addEventListener("resize", resizeHandler);

    return () => {
      window.removeEventListener("resize", resizeHandler);
      ctx.clearRect(0, 0, width, height);
    };
  }, []);

  return <canvas id="gradient-canvas" ref={canvasRef} />;
}
