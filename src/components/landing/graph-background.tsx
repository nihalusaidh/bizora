"use client";

import { useEffect, useRef } from "react";

export function GraphBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrame: number;
    let time = 0;

    const resize = () => {
      canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.offsetHeight || 400;
    };
    resize();
    window.addEventListener("resize", resize);

    // Grid dots
    const gridDots: { x: number; y: number; phase: number }[] = [];
    const spacing = 60;
    for (let gx = 0; gx < 1400; gx += spacing) {
      for (let gy = 0; gy < 500; gy += spacing) {
        gridDots.push({ x: gx, y: gy, phase: Math.random() * Math.PI * 2 });
      }
    }

    // Expanding rings
    const rings = Array.from({ length: 3 }, (_, i) => ({
      x: canvas.width * (0.25 + i * 0.25),
      y: canvas.height * 0.5,
      radius: 0,
      maxRadius: 50 + i * 30,
      delay: i * 1.5,
    }));

    // Data streams
    const streams = Array.from({ length: 4 }, (_, i) => ({
      y: canvas.height * (0.15 + i * 0.22),
      x: -150,
      speed: 0.8 + Math.random() * 1.5,
      length: 80 + Math.random() * 150,
    }));

    const animate = () => {
      time += 0.016;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Grid dots
      gridDots.forEach((dot) => {
        const pulse = 0.03 + Math.sin(time * 0.8 + dot.phase) * 0.02;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${pulse})`;
        ctx.fill();
      });

      // Graph lines
      const drawProgress = Math.min(1, time * 0.1);
      const points = [0.7, 0.62, 0.55, 0.5, 0.42, 0.38, 0.3, 0.25, 0.2, 0.15, 0.1];
      const segCount = points.length - 1;
      const segs = Math.floor(drawProgress * segCount);

      ctx.strokeStyle = "rgba(220,38,38,0.08)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i <= segs && i < points.length; i++) {
        const x = (i / segCount) * canvas.width;
        const y = points[i] * canvas.height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Data dots
      for (let i = 0; i <= segs && i < points.length; i++) {
        const x = (i / segCount) * canvas.width;
        const y = points[i] * canvas.height;
        const r = 2 + Math.sin(time * 3 + i) * 0.5;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(220,38,38,0.12)";
        ctx.fill();
      }

      if (drawProgress >= 1 && time % 8 < 0.02) time = 0;

      // Rings
      rings.forEach((ring) => {
        const t = Math.max(0, time - ring.delay);
        ring.radius = (t * 30) % ring.maxRadius;
        const alpha = 0.07 * (1 - ring.radius / ring.maxRadius);
        if (alpha > 0.005) {
          ctx.beginPath();
          ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(220,38,38,${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });

      // Data streams
      streams.forEach((s) => {
        s.x += s.speed;
        if (s.x > canvas.width + 200) s.x = -s.length - 200;
        const grad = ctx.createLinearGradient(s.x, 0, s.x + s.length, 0);
        grad.addColorStop(0, "rgba(220,38,38,0)");
        grad.addColorStop(0.5, "rgba(220,38,38,0.05)");
        grad.addColorStop(1, "rgba(220,38,38,0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x + s.length, s.y);
        ctx.stroke();
      });

      animFrame = requestAnimationFrame(animate);
    };

    animFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: 1 }}
      aria-hidden="true"
    />
  );
}
