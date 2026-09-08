"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createBusiness } from "@/server/actions/business";
import { BusinessTypeStep } from "@/components/onboarding/business-type-step";
import { BusinessNameStep } from "@/components/onboarding/business-name-step";
import { CurrencyStep } from "@/components/onboarding/currency-step";
import { GstStep } from "@/components/onboarding/gst-step";
import { BusinessSizeStep } from "@/components/onboarding/business-size-step";
import { ImportStep } from "@/components/onboarding/import-step";
import { ReadyStep } from "@/components/onboarding/ready-step";
import { ProgressBar } from "@/components/onboarding/progress-bar";
import { DemoMode } from "@/components/demo/demo-mode";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
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
      console.error("Failed to create business:", result.error);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  if (checkingUser) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const totalSteps = 7;
  const progress = ((step + 1) / totalSteps) * 100;

  return (
    <div className="space-y-6">
      <ProgressBar progress={progress} currentStep={step + 1} totalSteps={totalSteps} />

      {step === 0 && (
        <>
          <DemoMode />
          <BusinessTypeStep
            value={data.business_type}
            onSelect={(type) => {
              updateData({ business_type: type });
              setStep(1);
            }}
          />
        </>
      )}

      {step === 1 && (
        <BusinessNameStep
          value={data.business_name}
          onSubmit={(name) => {
            updateData({ business_name: name });
            setStep(2);
          }}
          onBack={() => setStep(0)}
        />
      )}

      {step === 2 && (
        <CurrencyStep
          currency={data.currency}
          currencySymbol={data.currency_symbol}
          onSelect={(currency, symbol) => {
            updateData({ currency, currency_symbol: symbol });
            setStep(3);
          }}
          onBack={() => setStep(1)}
        />
      )}

      {step === 3 && (
        <GstStep
          status={data.gst_status}
          gstin={data.gstin}
          onSelect={(status, gstin) => {
            updateData({ gst_status: status, gstin: gstin || "" });
            setStep(4);
          }}
          onBack={() => setStep(2)}
        />
      )}

      {step === 4 && (
        <BusinessSizeStep
          value={data.business_size}
          onSelect={(size) => {
            updateData({ business_size: size });
            setStep(5);
          }}
          onBack={() => setStep(3)}
        />
      )}

      {step === 5 && (
        <ImportStep
          onNext={() => setStep(6)}
          onBack={() => setStep(4)}
        />
      )}

      {step === 6 && (
        <ReadyStep
          businessName={data.business_name}
          onComplete={handleComplete}
          loading={loading}
        />
      )}
    </div>
  );
}
