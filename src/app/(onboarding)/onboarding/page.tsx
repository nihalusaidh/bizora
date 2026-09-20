"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { friendlySetupError } from "@/lib/errors";
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
    let cancelled = false;
    const checkUser = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (cancelled) return;
        if (!user) {
          router.push("/login");
          return;
        }

        const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 10000));
        const lookup = supabase
          .from("memberships")
          .select("business_id")
          .eq("user_id", user.id)
          .limit(1);
        const result = await Promise.race([lookup, timeout]);
        if (cancelled) return;

        if (result && Array.isArray((result as { data?: unknown }).data) && ((result as { data: unknown[] }).data.length > 0)) {
          router.push("/dashboard");
          return;
        }
        if (result === null) {
          setError("Setup check timed out. Check your connection, then retry.");
        }
        setCheckingUser(false);
      } catch {
        if (!cancelled) {
          setError("Could not verify your account. Check your connection, then retry.");
          setCheckingUser(false);
        }
      }
    };
    checkUser();
    return () => { cancelled = true; };
  }, [router]);

  const updateData = (updates: Partial<typeof data>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const handleComplete = async () => {
    setError("");
    if (!data.business_type) {
      setError("Please choose your business type.");
      setStep(inApp ? 1 : 2);
      return;
    }
    if (!data.business_name.trim()) {
      setError("Please enter your business name.");
      setStep(step > 0 ? step : 1);
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Not authenticated. Please sign in again.");
        setLoading(false);
        return;
      }

      const result = await createBusiness({
        name: data.business_name.trim(),
        type: data.business_type,
        currency: data.currency,
        currency_symbol: data.currency_symbol,
        gst_status: data.gst_status,
        gstin: data.gst_status === "registered" ? data.gstin : null,
        size: data.business_size,
      });

      if (result.error || !result.data) {
        setError(result.error || "Failed to create business. Please try again.");
        setLoading(false);
        return;
      }

      // Use window.location.href for full page reload so server components re-fetch
      window.location.href = "/dashboard";
    } catch (e) {
      setError(friendlySetupError(e));
      setLoading(false);
    }
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
            setStep(step + 1);
          }}
          onExpress={(name) => {
            updateData({ business_name: name });
            // Jump straight to Ready with smart defaults already in state.
            setStep(inApp ? 6 : 7);
          }}
          onBack={() => setStep(step - 1)}
        />
      )}

      {displayStep === 3 && (
        <CurrencyStep
          currency={data.currency}
          currencySymbol={data.currency_symbol}
          onSelect={(currency, symbol) => {
            updateData({ currency, currency_symbol: symbol });
            setStep(step + 1);
          }}
          onBack={() => setStep(step - 1)}
        />
      )}

      {displayStep === 4 && (
        <GstStep
          status={data.gst_status}
          gstin={data.gstin}
          onSelect={(status, gstin) => {
            updateData({ gst_status: status, gstin: gstin || "" });
            setStep(step + 1);
          }}
          onBack={() => setStep(step - 1)}
        />
      )}

      {displayStep === 5 && (
        <BusinessSizeStep
          value={data.business_size}
          onSelect={(size) => {
            updateData({ business_size: size });
            setStep(step + 1);
          }}
          onBack={() => setStep(step - 1)}
        />
      )}

      {displayStep === 6 && (
        <ImportStep
          onNext={() => setStep(step + 1)}
          onBack={() => setStep(step - 1)}
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
