"use client";

import { useEffect, useRef } from "react";

export function AnimatedBusinessBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrame: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // --- Floating business shapes ---
    const shapes = Array.from({ length: 14 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 20 + Math.random() * 35,
      speed: 0.2 + Math.random() * 0.4,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.008,
      type: Math.floor(Math.random() * 5),
    }));

    // --- Expanding rings (radar pulses) ---
    const rings = Array.from({ length: 4 }, (_, i) => ({
      x: canvas.width * (0.2 + i * 0.2),
      y: canvas.height * (0.3 + (i % 2) * 0.4),
      radius: 0,
      maxRadius: 60 + Math.random() * 80,
      speed: 0.3 + Math.random() * 0.3,
      delay: i * 2,
    }));

    // --- Horizontal data streams ---
    const streams = Array.from({ length: 6 }, (_, i) => ({
      y: canvas.height * (0.1 + i * 0.15),
      x: -200,
      speed: 1 + Math.random() * 2,
      length: 100 + Math.random() * 200,
      opacity: 0.03 + Math.random() * 0.04,
    }));

    // --- Floating circles (data points) ---
    const circles = Array.from({ length: 20 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: 2 + Math.random() * 4,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      pulse: Math.random() * Math.PI * 2,
    }));

    // --- Grid dots ---
    const gridDots: { x: number; y: number; brightness: number }[] = [];
    const gridSpacing = 80;
    for (let gx = 0; gx < canvas.width + gridSpacing; gx += gridSpacing) {
      for (let gy = 0; gy < canvas.height + gridSpacing; gy += gridSpacing) {
        gridDots.push({
          x: gx + (Math.random() - 0.5) * 10,
          y: gy + (Math.random() - 0.5) * 10,
          brightness: Math.random(),
        });
      }
    }

    // --- Business keywords ---
    const keywords = [
      "Revenue", "Profit", "Growth", "Sales", "Inventory",
      "Expenses", "Billing", "Analytics", "Margin", "Cash Flow",
      "Forecast", "Targets", "Outstanding", "GST", "ROI",
    ];
    const floatingWords = keywords.map((text, i) => ({
      text,
      x: 50 + Math.random() * (canvas.width - 100),
      y: canvas.height + 40 + i * 100,
      speed: 0.3 + Math.random() * 0.5,
      opacity: 0.04 + Math.random() * 0.04,
    }));

    // --- Number tickers ---
    const numbers = Array.from({ length: 15 }, () => ({
      value: Math.floor(Math.random() * 99999),
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      changeRate: 0.02 + Math.random() * 0.04,
    }));

    // --- Graph lines (multiple) ---
    const graphLines = [
      { points: [0.7, 0.62, 0.58, 0.5, 0.55, 0.42, 0.38, 0.3, 0.35, 0.22, 0.18, 0.1], yStart: 0.25, color: "220,38,38" },
      { points: [0.8, 0.72, 0.68, 0.6, 0.55, 0.5, 0.45, 0.42, 0.38, 0.35, 0.3, 0.25], yStart: 0.55, color: "255,255,255" },
    ];

    const drawInvoice = (x: number, y: number, size: number, alpha: number) => {
      ctx.strokeStyle = `rgba(220,38,38,${alpha})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(x, y, size * 0.7, size, 3);
      ctx.stroke();
      for (let i = 0; i < 4; i++) {
        const ly = y + size * 0.2 + i * size * 0.15;
        ctx.beginPath();
        ctx.moveTo(x + size * 0.12, ly);
        ctx.lineTo(x + size * 0.55, ly);
        ctx.stroke();
      }
    };

    const drawChart = (x: number, y: number, size: number, alpha: number) => {
      ctx.strokeStyle = `rgba(220,38,38,${alpha})`;
      ctx.lineWidth = 1;
      const barW = size * 0.12;
      const heights = [0.4, 0.6, 0.8, 0.5, 0.9];
      heights.forEach((h, i) => {
        ctx.strokeRect(x + i * (barW + 3), y + size * (1 - h), barW, size * h);
      });
    };

    const drawBox = (x: number, y: number, size: number, alpha: number) => {
      ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + size * 0.5, y);
      ctx.lineTo(x + size, y + size * 0.3);
      ctx.lineTo(x + size, y + size * 0.7);
      ctx.lineTo(x + size * 0.5, y + size);
      ctx.lineTo(x, y + size * 0.7);
      ctx.lineTo(x, y + size * 0.3);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + size * 0.5, y);
      ctx.lineTo(x + size * 0.5, y + size);
      ctx.stroke();
    };

    const drawRupee = (x: number, y: number, size: number, alpha: number) => {
      ctx.strokeStyle = `rgba(220,38,38,${alpha})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.font = `bold ${size * 0.5}px sans-serif`;
      ctx.fillStyle = `rgba(220,38,38,${alpha})`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("₹", x + size / 2, y + size / 2);
    };

    const drawReceipt = (x: number, y: number, size: number, alpha: number) => {
      ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
      ctx.lineWidth = 1;
      const w = size * 0.7;
      const h = size;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + w, y);
      ctx.lineTo(x + w, y + h);
      for (let i = 4; i >= 0; i--) {
        const sx = x + w - (i + 0.5) * (w / 5);
        ctx.lineTo(sx, y + h - 6);
        ctx.lineTo(sx - w / 10, y + h);
      }
      ctx.lineTo(x, y + h);
      ctx.closePath();
      ctx.stroke();
      for (let i = 0; i < 3; i++) {
        const ly = y + h * 0.2 + i * h * 0.18;
        ctx.beginPath();
        ctx.moveTo(x + w * 0.15, ly);
        ctx.lineTo(x + w * 0.75, ly);
        ctx.stroke();
      }
    };

    const drawFuncs = [drawInvoice, drawChart, drawBox, drawRupee, drawReceipt];

    const animate = () => {
      time += 0.016;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // --- Grid dots (pulsing) ---
      gridDots.forEach((dot) => {
        const pulse = 0.02 + Math.sin(time * 0.5 + dot.brightness * 10) * 0.015;
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${pulse})`;
        ctx.fill();
      });

      // --- Graph lines ---
      graphLines.forEach((line) => {
        const drawProgress = Math.min(1, time * 0.1);
        const segmentCount = line.points.length - 1;
        const segmentsToDraw = Math.floor(drawProgress * segmentCount);

        ctx.strokeStyle = `rgba(${line.color},0.06)`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let i = 0; i <= segmentsToDraw && i < line.points.length; i++) {
          const px = (i / segmentCount) * canvas.width;
          const py = canvas.height * line.yStart + line.points[i] * canvas.height * 0.15;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();

        // Data dots
        for (let i = 0; i <= segmentsToDraw && i < line.points.length; i++) {
          const px = (i / segmentCount) * canvas.width;
          const py = canvas.height * line.yStart + line.points[i] * canvas.height * 0.15;
          const dotPulse = 2 + Math.sin(time * 3 + i) * 0.8;
          ctx.beginPath();
          ctx.arc(px, py, dotPulse, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${line.color},0.1)`;
          ctx.fill();
        }

        if (drawProgress >= 1 && time % 10 < 0.02) time = 0;
      });

      // --- Expanding rings ---
      rings.forEach((ring) => {
        const t = Math.max(0, time - ring.delay);
        ring.radius = (t * ring.speed * 40) % ring.maxRadius;
        const alpha = 0.06 * (1 - ring.radius / ring.maxRadius);
        if (alpha > 0.005) {
          ctx.beginPath();
          ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(220,38,38,${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });

      // --- Horizontal data streams ---
      streams.forEach((s) => {
        s.x += s.speed;
        if (s.x > canvas.width + 200) s.x = -s.length - 200;
        const gradient = ctx.createLinearGradient(s.x, 0, s.x + s.length, 0);
        gradient.addColorStop(0, `rgba(220,38,38,0)`);
        gradient.addColorStop(0.5, `rgba(220,38,38,${s.opacity})`);
        gradient.addColorStop(1, `rgba(220,38,38,0)`);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x + s.length, s.y);
        ctx.stroke();
      });

      // --- Floating circles ---
      circles.forEach((c) => {
        c.x += c.vx;
        c.y += c.vy;
        c.pulse += 0.02;
        if (c.x < 0) c.x = canvas.width;
        if (c.x > canvas.width) c.x = 0;
        if (c.y < 0) c.y = canvas.height;
        if (c.y > canvas.height) c.y = 0;
        const r = c.r + Math.sin(c.pulse) * 0.8;
        ctx.beginPath();
        ctx.arc(c.x, c.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220,38,38,0.04)`;
        ctx.fill();
        ctx.strokeStyle = `rgba(220,38,38,0.03)`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });

      // --- Floating shapes ---
      shapes.forEach((s) => {
        s.y -= s.speed;
        s.rot += s.rotSpeed;
        if (s.y < -80) {
          s.y = canvas.height + 80;
          s.x = Math.random() * canvas.width;
        }
        ctx.save();
        ctx.translate(s.x + s.size / 2, s.y + s.size / 2);
        ctx.rotate(s.rot);
        drawFuncs[s.type](-s.size / 2, -s.size / 2, s.size, 0.04);
        ctx.restore();
      });

      // --- Floating keywords ---
      floatingWords.forEach((w) => {
        w.y -= w.speed;
        if (w.y < -30) {
          w.y = canvas.height + 30;
          w.x = 50 + Math.random() * (canvas.width - 100);
        }
        ctx.font = "11px sans-serif";
        ctx.fillStyle = `rgba(255,255,255,${w.opacity})`;
        ctx.textAlign = "center";
        ctx.fillText(w.text, w.x, w.y);
      });

      // --- Number tickers ---
      numbers.forEach((n) => {
        if (Math.random() < n.changeRate) {
          n.value = Math.floor(Math.random() * 99999);
        }
        ctx.font = "10px monospace";
        ctx.fillStyle = "rgba(220,38,38,0.03)";
        ctx.textAlign = "center";
        ctx.fillText(`₹${n.value.toLocaleString("en-IN")}`, n.x, n.y);
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
