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

    const animate = () => {
      time += 0.016;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Animated graph line going up
      const drawProgress = Math.min(1, time * 0.12);
      const segmentCount = 14;
      const segmentsToDraw = Math.floor(drawProgress * segmentCount);

      const points = [0.75, 0.68, 0.6, 0.55, 0.5, 0.42, 0.38, 0.35, 0.28, 0.25, 0.2, 0.15, 0.12, 0.08];

      ctx.strokeStyle = "rgba(220,38,38,0.04)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i <= segmentsToDraw && i < points.length; i++) {
        const x = (i / (segmentCount - 1)) * canvas.width;
        const y = points[i] * canvas.height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Data point dots
      for (let i = 0; i <= segmentsToDraw && i < points.length; i++) {
        const x = (i / (segmentCount - 1)) * canvas.width;
        const y = points[i] * canvas.height;
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220,38,38,${0.06 + Math.sin(time * 2 + i) * 0.02})`;
        ctx.fill();
      }

      // Subtle horizontal grid lines
      for (let i = 0; i < 5; i++) {
        const y = (i / 4) * canvas.height;
        ctx.strokeStyle = "rgba(255,255,255,0.015)";
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Reset for loop
      if (drawProgress >= 1 && time % 10 < 0.02) {
        time = 0;
      }

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
      style={{ opacity: 0.8 }}
      aria-hidden="true"
    />
  );
}
