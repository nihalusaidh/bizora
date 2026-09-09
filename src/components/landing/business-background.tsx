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

    // --- Floating shapes ---
    const shapes = Array.from({ length: 12 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 15 + Math.random() * 25,
      speed: 0.1 + Math.random() * 0.2,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.005,
      type: Math.floor(Math.random() * 4), // 0=invoice 1=chart 2=box 3=rupee
    }));

    // --- Graph lines (animated drawing) ---
    const graphLines = [
      { points: [0.7, 0.65, 0.55, 0.6, 0.45, 0.35, 0.4, 0.25, 0.3, 0.15, 0.2, 0.1], y: canvas.height * 0.3 },
      { points: [0.8, 0.75, 0.7, 0.65, 0.55, 0.6, 0.5, 0.45, 0.4, 0.35, 0.3, 0.25], y: canvas.height * 0.6 },
    ];

    // --- Floating keywords ---
    const keywords = [
      "Revenue", "Profit", "Growth", "Sales", "Inventory",
      "Expenses", "Billing", "Analytics", "Customers", "Margin",
      "Outstanding", "Cash Flow", "Forecast", "ROI", "Targets",
    ];
    const floatingWords = keywords.map((text, i) => ({
      text,
      x: Math.random() * canvas.width,
      y: canvas.height + 50 + i * 80,
      speed: 0.15 + Math.random() * 0.25,
      opacity: 0.02 + Math.random() * 0.025,
    }));

    // --- Number ticker ---
    const numbers = Array.from({ length: 20 }, () => ({
      value: Math.floor(Math.random() * 99999),
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      speed: 0.05 + Math.random() * 0.1,
      changeRate: 0.01 + Math.random() * 0.03,
    }));

    const drawInvoice = (x: number, y: number, size: number, alpha: number) => {
      ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(x, y, size * 0.7, size, 3);
      ctx.stroke();
      // lines
      for (let i = 0; i < 4; i++) {
        const ly = y + size * 0.2 + i * size * 0.15;
        ctx.beginPath();
        ctx.moveTo(x + size * 0.12, ly);
        ctx.lineTo(x + size * 0.55, ly);
        ctx.stroke();
      }
    };

    const drawChart = (x: number, y: number, size: number, alpha: number) => {
      ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
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
      ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.font = `bold ${size * 0.5}px sans-serif`;
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("₹", x + size / 2, y + size / 2);
    };

    const drawFuncs = [drawInvoice, drawChart, drawBox, drawRupee];

    const animate = () => {
      time += 0.016;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // --- Draw graph lines ---
      graphLines.forEach((line) => {
        const segmentCount = line.points.length - 1;
        const drawProgress = Math.min(1, time * 0.15);
        const segmentsToDraw = Math.floor(drawProgress * segmentCount);

        ctx.strokeStyle = "rgba(220,38,38,0.06)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        const startX = canvas.width * 0.15;
        const endX = canvas.width * 0.85;
        const rangeX = endX - startX;

        for (let i = 0; i <= segmentsToDraw && i < line.points.length; i++) {
          const px = startX + (i / segmentCount) * rangeX;
          const py = line.y + line.points[i] * canvas.height * 0.15;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();

        // Dots at data points
        for (let i = 0; i <= segmentsToDraw && i < line.points.length; i++) {
          const px = startX + (i / segmentCount) * rangeX;
          const py = line.y + line.points[i] * canvas.height * 0.15;
          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(220,38,38,${0.08 + Math.sin(time * 2 + i) * 0.03})`;
          ctx.fill();
        }

        // Redraw loop
        if (drawProgress >= 1 && time % 8 < 0.02) {
          time = 0;
        }
      });

      // --- Draw floating shapes ---
      shapes.forEach((s) => {
        s.y -= s.speed;
        s.rot += s.rotSpeed;
        if (s.y < -60) {
          s.y = canvas.height + 60;
          s.x = Math.random() * canvas.width;
        }
        ctx.save();
        ctx.translate(s.x + s.size / 2, s.y + s.size / 2);
        ctx.rotate(s.rot);
        drawFuncs[s.type](-s.size / 2, -s.size / 2, s.size, 0.025);
        ctx.restore();
      });

      // --- Draw floating keywords ---
      floatingWords.forEach((w) => {
        w.y -= w.speed;
        if (w.y < -30) {
          w.y = canvas.height + 30;
          w.x = Math.random() * canvas.width;
        }
        ctx.font = "10px sans-serif";
        ctx.fillStyle = `rgba(255,255,255,${w.opacity})`;
        ctx.textAlign = "center";
        ctx.fillText(w.text, w.x, w.y);
      });

      // --- Draw number tickers ---
      numbers.forEach((n) => {
        if (Math.random() < n.changeRate) {
          n.value = Math.floor(Math.random() * 99999);
        }
        ctx.font = "9px monospace";
        ctx.fillStyle = "rgba(255,255,255,0.015)";
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
      style={{ opacity: 0.7 }}
      aria-hidden="true"
    />
  );
}
