"use client";

import { useState } from "react";
import { Monitor, Smartphone, Download, ArrowRight, ArrowLeft } from "lucide-react";

interface PlatformStepProps {
  onSelect: (platform: "web" | "desktop" | "android") => void;
}

const platforms = [
  {
    id: "web" as const,
    title: "Use on Web",
    description: "Open in browser — no download needed",
    icon: Monitor,
    color: "bg-[#DC2626]/10 text-[#DC2626] group-hover:bg-[#DC2626]/20",
    badge: "Recommended",
  },
  {
    id: "desktop" as const,
    title: "Download for Windows",
    description: "Desktop app — works offline",
    icon: Download,
    color: "bg-blue-500/10 text-blue-600 group-hover:bg-blue-500/20",
    badge: null,
  },
  {
    id: "android" as const,
    title: "Download for Android",
    description: "Mobile app — scan barcodes on the go",
    icon: Smartphone,
    color: "bg-green-500/10 text-green-600 group-hover:bg-green-500/20",
    badge: null,
  },
];

export function PlatformStep({ onSelect }: PlatformStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight">How will you use BIZORA?</h2>
        <p className="text-muted-foreground mt-1">Choose your preferred platform. You can always change this later.</p>
      </div>

      <div className="space-y-3">
        {platforms.map((platform) => (
          <button
            key={platform.id}
            onClick={() => onSelect(platform.id)}
            className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-border hover:border-[#DC2626] hover:bg-[#DC2626]/5 transition-all duration-200 text-left group"
          >
            <div className={`h-12 w-12 rounded-lg flex items-center justify-center shrink-0 transition-colors ${platform.color}`}>
              <platform.icon className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{platform.title}</h3>
                {platform.badge && (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-[#DC2626] text-white px-2 py-0.5 rounded-full">
                    {platform.badge}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{platform.description}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-[#DC2626] transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
}
