"use client";

import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Check, Sparkles, Gem, Crown, Star, Smartphone, CreditCard, Tag, Loader2 } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useBusiness } from "@/lib/store";
import { PLAN_CONFIGS, getAvailablePlans } from "@/lib/entitlements";
import { createClient } from "@/lib/supabase/client";

type BillingCycle = "monthly" | "yearly";

function detectPlatform(): "mobile" | "web" | "desktop" {
  if (typeof window === "undefined") return "web";
  const ua = navigator.userAgent.toLowerCase();
  if (/android|iphone|ipad|ipod/.test(ua)) return "mobile";
  return "web";
}

const planIcons = { free: Star, gold: Crown, diamond: Gem };

const COUPON_CODE = "bizora@abu";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function SubscriptionPage() {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [couponInput, setCouponInput] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [selectedPlanForCoupon, setSelectedPlanForCoupon] = useState<string | null>(null);
  const currentPlan = useAppStore((s) => s.plan);
  const setPlan = useAppStore((s) => s.setPlan);
  const { business, businessId } = useBusiness();
  const platform = detectPlatform();
  const availablePlans = getAvailablePlans(platform);

  const yearlySavings = (plan: (typeof PLAN_CONFIGS)[keyof typeof PLAN_CONFIGS]) => {
    if (plan.yearlyPrice === 0) return 0;
    return plan.monthlyPrice * 12 - plan.yearlyPrice;
  };

  const handleCouponActivate = useCallback(
    async (planKey: string) => {
      if (!couponInput.trim()) {
        setCouponError("Enter a coupon code");
        return;
      }

      setCouponLoading(true);
      setCouponError("");

      // Simulate network delay
      await new Promise((r) => setTimeout(r, 500));

      if (couponInput.trim().toLowerCase() === COUPON_CODE) {
        setCouponApplied(true);
        setSelectedPlanForCoupon(planKey);

        // Update Supabase
        if (businessId) {
          const supabase = createClient();
          await supabase
            .from("businesses")
            .update({ plan: planKey, subscription_status: "active" })
            .eq("id", businessId);
        }

        // Update local store
        setPlan(planKey as any);
      } else {
        setCouponError("Invalid coupon code");
      }

      setCouponLoading(false);
    },
    [couponInput, businessId, setPlan]
  );

  const handleCheckout = useCallback(
    (planKey: string, amount: number) => {
      if (!businessId || !business) return;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
        amount: amount * 100,
        currency: "INR",
        name: "BIZORA",
        description: `${PLAN_CONFIGS[planKey as keyof typeof PLAN_CONFIGS].name} Plan`,
        handler: async function (response: any) {
          try {
            await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                business_id: businessId,
                plan: planKey,
              }),
            });
          } catch {
            // Webhook will handle it as backup
          }
          setPlan(planKey as any);
        },
        prefill: {
          name: business.name || "",
          email: business.email || "",
          contact: business.phone || "",
        },
        notes: {
          business_id: businessId,
          plan: planKey,
        },
        theme: {
          color: "#DC2626",
        },
        modal: {
          ondismiss: function () {},
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    },
    [businessId, business, setPlan]
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Subscription</h1>
        <p className="text-muted-foreground">Manage your plan and billing</p>
      </div>

      <Card className="border-[#DC2626]/20 bg-[#DC2626]/5">
        <CardContent className="p-4 flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-[#DC2626]" />
          <div className="flex-1">
            <p className="text-sm font-medium">
              Current Plan:{" "}
              <Badge variant="secondary" className="ml-1 capitalize">
                {PLAN_CONFIGS[currentPlan].name}
              </Badge>
            </p>
            <p className="text-xs text-muted-foreground">
              Upgrade to unlock all features
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Coupon Code Section */}
      {currentPlan === "free" && (
        <Card className="border-[#DC2626]/30 bg-gradient-to-br from-[#DC2626]/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="h-4 w-4 text-[#DC2626]" />
              <p className="text-sm font-semibold">Have a coupon code?</p>
            </div>
            {couponApplied ? (
              <div className="flex items-center gap-2 text-green-600">
                <Check className="h-4 w-4" />
                <p className="text-sm font-medium">
                  Coupon applied! You now have {PLAN_CONFIGS[selectedPlanForCoupon as keyof typeof PLAN_CONFIGS]?.name} plan.
                </p>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder="Enter coupon code"
                  value={couponInput}
                  onChange={(e) => {
                    setCouponInput(e.target.value);
                    setCouponError("");
                  }}
                  className="font-mono"
                />
                {selectedPlanForCoupon ? (
                  <Button
                    onClick={() => handleCouponActivate(selectedPlanForCoupon)}
                    disabled={couponLoading || !couponInput.trim()}
                    className="gap-2 shrink-0"
                  >
                    {couponLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    Activate
                  </Button>
                ) : null}
              </div>
            )}
            {couponError && (
              <p className="text-xs text-destructive mt-2">{couponError}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Mobile notice */}
      {platform === "mobile" && (
        <Card className="border-neutral-200">
          <CardContent className="p-4 flex items-center gap-3">
            <Smartphone className="h-5 w-5 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              On mobile, only Free and Gold plans are available. Diamond plan
              features are best used on desktop or web.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-center">
        <div className="inline-flex items-center rounded-lg border bg-muted p-0.5">
          <button
            onClick={() => setCycle("monthly")}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              cycle === "monthly"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setCycle("yearly")}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              cycle === "yearly"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Yearly
            <span className="ml-1.5 text-xs text-[#DC2626] font-semibold">Save</span>
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {(Object.entries(PLAN_CONFIGS) as [string, typeof PLAN_CONFIGS.free][]).map(
          ([key, plan]) => {
            const planKey = key as keyof typeof planIcons;
            const Icon = planIcons[planKey];
            const price = cycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
            const isCurrent = currentPlan === key;
            const isAvailable = availablePlans.includes(key as any);
            const perMonth =
              cycle === "yearly" && plan.yearlyPrice > 0
                ? Math.round(plan.yearlyPrice / 12)
                : plan.monthlyPrice;
            const isGold = key === "gold";

            return (
              <Card
                key={key}
                className={`relative ${
                  isGold ? "border-[#DC2626] shadow-md" : ""
                } ${!isAvailable ? "opacity-50" : ""}`}
              >
                {isGold && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-[#DC2626] text-white">MOST POPULAR</Badge>
                  </div>
                )}
                {!isAvailable && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="secondary">Desktop Only</Badge>
                  </div>
                )}
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-lg font-bold">{plan.name}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    {plan.name === "Free"
                      ? "Try Bizora"
                      : plan.name === "Gold"
                      ? "Understand Your Business"
                      : "Grow & Automate"}
                  </p>
                  <div className="mb-4">
                    <span className="text-3xl font-bold">
                      ₹{price === 0 ? "0" : perMonth.toLocaleString("en-IN")}
                    </span>
                    <span className="text-muted-foreground text-sm">
                      {price === 0 ? "/forever" : "/month"}
                    </span>
                    {cycle === "yearly" && plan.yearlyPrice > 0 && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        ₹{plan.yearlyPrice.toLocaleString("en-IN")}/year · Save ₹
                        {yearlySavings(plan).toLocaleString("en-IN")}
                      </p>
                    )}
                  </div>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-foreground mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  {isCurrent ? (
                    <Button className="w-full" variant="outline" disabled>
                      Current Plan
                    </Button>
                  ) : !isAvailable ? (
                    <Button className="w-full" variant="outline" disabled>
                      Not Available on Mobile
                    </Button>
                  ) : plan.monthlyPrice === 0 ? (
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => setPlan(key as any)}
                    >
                      Upgrade
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <Button
                        className="w-full gap-2"
                        variant={isGold ? "default" : "outline"}
                        onClick={() => {
                          const price = cycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
                          if (price > 0) {
                            handleCheckout(key, price);
                          } else {
                            setPlan(key as any);
                          }
                        }}
                      >
                        <CreditCard className="h-4 w-4" />
                        Pay & Upgrade
                      </Button>
                      {!couponApplied && currentPlan === "free" && (
                        <Button
                          className="w-full gap-2"
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedPlanForCoupon(key)}
                        >
                          <Tag className="h-4 w-4" />
                          Use Coupon
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          }
        )}
      </div>
    </div>
  );
}
