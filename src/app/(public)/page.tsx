"use client";

import { Preloader } from "@/components/landing/preloader";
import { Hero } from "@/components/landing/hero";
import { StatsBar } from "@/components/landing/stats-bar";
import { Features } from "@/components/landing/features";
import { AiSection } from "@/components/landing/ai-section";
import { OfflineSection } from "@/components/landing/offline-section";
import { Platforms } from "@/components/landing/platforms";
import { Pricing } from "@/components/landing/pricing";
import { FinalCta } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Preloader />
      <Hero />
      <StatsBar />
      <Features />
      <AiSection />
      <OfflineSection />
      <Platforms />
      <Pricing />
      <FinalCta />
      <Footer />
    </div>
  );
}
