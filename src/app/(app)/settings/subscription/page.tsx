"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Gem, Crown, Star } from "lucide-react";

type BillingCycle = "monthly" | "yearly";

const plans = [
  {
    name: "Free",
    icon: Star,
    price: { monthly: 0, yearly: 0 },
    description: "Try Bizora",
    features: [
      "Up to 100 products",
      "Basic invoicing",
      "Expense tracking",
      "50 invoices/month",
      "Single user",
    ],
  },
  {
    name: "Gold",
    icon: Crown,
    price: { monthly: 399, yearly: 3990 },
    description: "Understand Your Business",
    badge: "MOST POPULAR",
    features: [
      "Unlimited products",
      "Digital Khata",
      "AI Assistant",
      "Team management",
      "Priority support",
      "Unlimited invoices",
      "Advanced reports",
    ],
  },
  {
    name: "Diamond",
    icon: Gem,
    price: { monthly: 699, yearly: 6990 },
    description: "Grow & Automate",
    features: [
      "Everything in Gold",
      "Multi-branch support",
      "Custom integrations",
      "Dedicated support",
      "API access",
      "White-label option",
      "Automated workflows",
    ],
  },
];

export default function SubscriptionPage() {
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [currentPlan] = useState<"free" | "gold" | "diamond">("free");

  const yearlySavings = (plan: (typeof plans)[number]) => {
    if (plan.price.yearly === 0) return 0;
    return plan.price.monthly * 12 - plan.price.yearly;
  };

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
                {currentPlan}
              </Badge>
            </p>
            <p className="text-xs text-muted-foreground">
              Upgrade to unlock all features
            </p>
          </div>
        </CardContent>
      </Card>

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
        {plans.map((plan) => {
          const Icon = plan.icon;
          const price = cycle === "monthly" ? plan.price.monthly : plan.price.yearly;
          const isCurrent = currentPlan === plan.name.toLowerCase();
          const perMonth = cycle === "yearly" && plan.price.yearly > 0
            ? Math.round(plan.price.yearly / 12)
            : plan.price.monthly;

          return (
            <Card
              key={plan.name}
              className={`relative ${
                plan.badge ? "border-[#DC2626] shadow-md" : ""
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-[#DC2626] text-white">{plan.badge}</Badge>
                </div>
              )}
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-lg font-bold">{plan.name}</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  {plan.description}
                </p>
                <div className="mb-4">
                  <span className="text-3xl font-bold">
                    ₹{price === 0 ? "0" : perMonth.toLocaleString("en-IN")}
                  </span>
                  <span className="text-muted-foreground text-sm">
                    {price === 0 ? "/forever" : "/month"}
                  </span>
                  {cycle === "yearly" && plan.price.yearly > 0 && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      ₹{plan.price.yearly.toLocaleString("en-IN")}/year · Save ₹
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
                ) : plan.name === "Diamond" && cycle === "yearly" ? (
                  <Button className="w-full" variant="outline">
                    Contact Sales
                  </Button>
                ) : (
                  <Button className="w-full" variant={plan.badge ? "default" : "outline"}>
                    Upgrade
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
