"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number; // -1..1 across
  y: number; // -1..1 down
  z: number; // 0 (far) .. 1 (near)
  r: number; // base radius
  tw: number; // twinkle phase
}

/** Full-screen warp starfield. Speed follows dive velocity. */
export function Starfield({ velocity, station, stations }: { velocity: number; station: number; stations: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const state = useRef({ stars: [] as Star[], v: 0, station: 0 });

  useEffect(() => {
    state.current.v = velocity;
    state.current.station = station;
  }, [velocity, station]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let raf = 0;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const N = window.innerWidth < 640 ? 130 : 220;

    const seed = () => {
      state.current.stars = Array.from({ length: N }, () => ({
        x: Math.random() * 2 - 1,
        y: Math.random() * 2 - 1,
        z: Math.random(),
        r: 0.4 + Math.random() * 1.4,
        tw: Math.random() * Math.PI * 2,
      }));
    };

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * DPR;
      canvas.height = h * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };

    // Nebula tint drifts red → deep maroon → ember as you dive.
    const tints = ["220,38,38", "153,27,27", "220,38,38", "124,20,20", "220,60,30"];
    let time = 0;

    const frame = () => {
      time += 0.016;
      const s = state.current;
      const speed = 0.0016 + Math.min(s.v, 1.5) * 0.02;
      const cx = w / 2;
      const cy = h * 0.42;
      const maxR = Math.hypot(cx, cy);

      ctx.clearRect(0, 0, w, h);

      // Deep-space gradient backdrop shifting per station.
      const tint = tints[s.station % tints.length];
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);
      g.addColorStop(0, `rgba(${tint},0.16)`);
      g.addColorStop(0.55, "rgba(10,10,10,0.55)");
      g.addColorStop(1, "#0a0a0a");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      const warp = Math.min(s.v, 1.5);
      for (const st of s.stars) {
        st.z += speed * (0.35 + st.z);
        if (st.z > 1) {
          st.z = 0.02;
          st.x = Math.random() * 2 - 1;
          st.y = Math.random() * 2 - 1;
        }
        const px = cx + st.x * maxR * st.z;
        const py = cy + st.y * maxR * st.z;
        const twinkle = 0.55 + 0.45 * Math.sin(time * 2 + st.tw);
        const alpha = Math.min(1, (0.25 + st.z * 0.9) * twinkle);
        const size = st.r * (0.5 + st.z * 1.6);

        if (warp > 0.25) {
          // Streak toward viewer.
          const len = warp * 60 * st.z;
          const dx = (px - cx) / (maxR || 1);
          const dy = (py - cy) / (maxR || 1);
          ctx.strokeStyle = `rgba(255,235,235,${Math.min(0.8, alpha)})`;
          ctx.lineWidth = size * 0.8;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px - dx * len, py - dy * len);
          ctx.stroke();
        } else {
          ctx.fillStyle = st.z > 0.75 ? `rgba(255,255,255,${alpha})` : `rgba(255,200,200,${alpha * 0.9})`;
          ctx.beginPath();
          ctx.arc(px, py, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      raf = requestAnimationFrame(frame);
    };

    seed();
    resize();
    frame();
    window.addEventListener("resize", () => {
      seed();
      resize();
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={ref} className="absolute inset-0 h-full w-full" aria-hidden />;
}
