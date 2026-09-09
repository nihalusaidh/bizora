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
    <section className="py-24 px-4 sm:px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <ScrollReveal direction="left">
            <div>
              <div className="inline-flex items-center gap-2 bg-neutral-100 text-neutral-600 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
                <WifiOff className="w-3.5 h-3.5" />
                Offline First
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0a0a0a] mb-4">
                Works offline.
                <br />
                <span className="text-[#DC2626]">
                  Syncs when you&apos;re back.
                </span>
              </h2>
              <p className="text-neutral-500 text-lg leading-relaxed mb-6">
                No internet? No problem. Keep running your business without
                interruption. Everything syncs automatically when you reconnect.
              </p>
              <div className="flex items-center gap-2 text-sm text-neutral-400">
                <Wifi className="w-4 h-4 text-[#0a0a0a]" />
                Automatic background sync
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="right" delay={200}>
            <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-8">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-5">
                Available Offline
              </p>
              <div className="space-y-3">
                {offlineFeatures.map((feat) => (
                  <div key={feat} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-[#0a0a0a] rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-neutral-700">
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
