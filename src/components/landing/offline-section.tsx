"use client";

import { WifiOff, Wifi, Check } from "lucide-react";
import { ScrollReveal } from "./scroll-reveal";

const offlineFeatures = [
  "Create and save bills",
  "View customer history",
  "Check inventory levels",
  "Log expenses",
  "Access recent analytics",
  "Queue transactions for sync",
];

export function OfflineSection() {
  return (
    <section className="relative py-28 px-4 sm:px-6 bg-white overflow-hidden">
      {/* Top accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[1px] bg-neutral-200" />

      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <ScrollReveal direction="left">
            <div>
              <div className="inline-flex items-center gap-2 bg-neutral-100 text-neutral-500 text-[11px] font-semibold px-4 py-2 rounded-full mb-8 tracking-wide">
                <WifiOff className="w-3.5 h-3.5" />
                OFFLINE FIRST
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-[-0.03em] text-[#0a0a0a] mb-5 leading-tight">
                Works offline.
                <br />
                <span className="relative inline-block">
                  <span className="relative z-10 text-[#DC2626]">
                    Syncs when you&apos;re back.
                  </span>
                  <span className="absolute bottom-1 left-0 right-0 h-[3px] bg-[#DC2626]/20 rounded-full" />
                </span>
              </h2>
              <p className="text-neutral-400 text-lg leading-relaxed mb-8 font-light">
                No internet? No problem. Keep running your business without
                interruption. Everything syncs automatically when you reconnect.
              </p>
              <div className="flex items-center gap-2.5 text-sm text-neutral-400">
                <div className="w-5 h-5 rounded-full bg-[#0a0a0a] flex items-center justify-center">
                  <Wifi className="w-3 h-3 text-white" />
                </div>
                Automatic background sync
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="right" delay={200}>
            <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-8 relative overflow-hidden">
              {/* Glow */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#DC2626]/[0.03] rounded-full blur-[60px]" />

              <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-[0.2em] mb-6 relative z-10">
                Available Offline
              </p>
              <div className="space-y-3.5 relative z-10">
                {offlineFeatures.map((feat, i) => (
                  <div key={feat} className="flex items-center gap-3.5 group">
                    <div className="w-6 h-6 bg-[#0a0a0a] rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-[#DC2626] transition-colors duration-300">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-neutral-600">
                      {feat}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
