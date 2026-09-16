"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createBusiness } from "@/server/actions/business";
import { PlatformStep } from "@/components/onboarding/platform-step";
import { BusinessTypeStep } from "@/components/onboarding/business-type-step";
import { BusinessNameStep } from "@/components/onboarding/business-name-step";
import { CurrencyStep } from "@/components/onboarding/currency-step";
import { GstStep } from "@/components/onboarding/gst-step";
import { BusinessSizeStep } from "@/components/onboarding/business-size-step";
import { ImportStep } from "@/components/onboarding/import-step";
import { ReadyStep } from "@/components/onboarding/ready-step";
import { ProgressBar } from "@/components/onboarding/progress-bar";
import { DemoMode } from "@/components/demo/demo-mode";
import { isCapacitor } from "@/lib/platform";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkingUser, setCheckingUser] = useState(true);
  const [data, setData] = useState({
    business_type: "",
    business_name: "",
    currency: "INR",
    currency_symbol: "₹",
    gst_status: "unregistered" as "registered" | "unregistered",
    gstin: "",
    business_size: "small" as "solo" | "small" | "medium" | "large",
  });

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: memberships } = await supabase
        .from("memberships")
        .select("business_id")
        .eq("user_id", user.id)
        .limit(1);

      if (memberships && memberships.length > 0) {
        router.push("/dashboard");
        return;
      }

      setCheckingUser(false);
    };
    checkUser();
  }, [router]);

  const updateData = (updates: Partial<typeof data>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const handleComplete = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Not authenticated. Please sign in again.");
      setLoading(false);
      return;
    }

    const result = await createBusiness({
      name: data.business_name,
      type: data.business_type,
      currency: data.currency,
      currency_symbol: data.currency_symbol,
      gst_status: data.gst_status,
      gstin: data.gst_status === "registered" ? data.gstin : null,
      size: data.business_size,
    });

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    // Use window.location.href for full page reload so server components re-fetch
    window.location.href = "/dashboard";
  };

  if (checkingUser) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const inApp = isCapacitor();
  const totalSteps = inApp ? 7 : 8;
  const progress = ((step + 1) / totalSteps) * 100;

  // In app mode, skip platform step (step 0) — displayStep shifts steps down by 1
  const displayStep = inApp ? step + 1 : step;

  return (
    <div className="space-y-6">
      <ProgressBar progress={progress} currentStep={step + 1} totalSteps={totalSteps} />

      {error && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
          {error}
        </div>
      )}

      {!inApp && step === 0 && (
        <PlatformStep
          onSelect={(platform) => {
            if (platform === "desktop" || platform === "android") {
              window.location.href = "/download";
            } else {
              setStep(1);
            }
          }}
        />
      )}

      {(inApp || step !== 0) && displayStep === 1 && (
        <>
          <DemoMode />
          <BusinessTypeStep
            value={data.business_type}
            onSelect={(type) => {
              updateData({ business_type: type });
              setStep(inApp ? 1 : 2);
            }}
          />
        </>
      )}

      {displayStep === 2 && (
        <BusinessNameStep
          value={data.business_name}
          onSubmit={(name) => {
            updateData({ business_name: name });
            setStep(inApp ? 2 : 3);
          }}
          onBack={() => setStep(inApp ? 1 : 1)}
        />
      )}

      {displayStep === 3 && (
        <CurrencyStep
          currency={data.currency}
          currencySymbol={data.currency_symbol}
          onSelect={(currency, symbol) => {
            updateData({ currency, currency_symbol: symbol });
            setStep(inApp ? 3 : 4);
          }}
          onBack={() => setStep(inApp ? 2 : 2)}
        />
      )}

      {displayStep === 4 && (
        <GstStep
          status={data.gst_status}
          gstin={data.gstin}
          onSelect={(status, gstin) => {
            updateData({ gst_status: status, gstin: gstin || "" });
            setStep(inApp ? 4 : 5);
          }}
          onBack={() => setStep(inApp ? 3 : 3)}
        />
      )}

      {displayStep === 5 && (
        <BusinessSizeStep
          value={data.business_size}
          onSelect={(size) => {
            updateData({ business_size: size });
            setStep(inApp ? 5 : 6);
          }}
          onBack={() => setStep(inApp ? 4 : 4)}
        />
      )}

      {displayStep === 6 && (
        <ImportStep
          onNext={() => setStep(inApp ? 6 : 7)}
          onBack={() => setStep(inApp ? 5 : 5)}
        />
      )}

      {displayStep === 7 && (
        <ReadyStep
          businessName={data.business_name}
          onComplete={handleComplete}
          loading={loading}
        />
      )}
    </div>
  );
}
