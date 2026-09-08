"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles } from "lucide-react";
import { useBusiness } from "@/lib/store";

const plans = [
  {
    name: "Free",
    price: "0",
    period: "forever",
    features: ["Up to 100 products", "Basic invoicing", "Expense tracking", "50 invoices/month"],
    current: true,
  },
  {
    name: "Pro",
    price: "499",
    period: "/month",
    features: ["Unlimited products", "Digital Khata", "AI Assistant", "Team management", "Priority support", "Unlimited invoices"],
    current: false,
    recommended: true,
  },
  {
    name: "Enterprise",
    price: "1499",
    period: "/month",
    features: ["Everything in Pro", "Multi-branch", "Custom integrations", "Dedicated support", "API access", "White-label option"],
    current: false,
  },
];

export default function SubscriptionPage() {
  const { business } = useBusiness();

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Subscription</h1>
        <p className="text-muted-foreground">Manage your plan and billing</p>
      </div>

      <Card className="border-primary bg-primary/5">
        <CardContent className="p-4 flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium">Current Plan: <Badge variant="secondary">Free</Badge></p>
            <p className="text-xs text-muted-foreground">Upgrade to unlock all features</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.name} className={plan.recommended ? "border-primary shadow-md relative" : ""}>
            {plan.recommended && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
              </div>
            )}
            <CardContent className="p-6">
              <h3 className="text-lg font-bold">{plan.name}</h3>
              <div className="mt-2 mb-4">
                <span className="text-3xl font-bold">₹{plan.price}</span>
                <span className="text-muted-foreground text-sm">{plan.period}</span>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-success mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="w-full"
                variant={plan.current ? "outline" : plan.recommended ? "default" : "outline"}
                disabled={plan.current}
              >
                {plan.current ? "Current Plan" : "Upgrade"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
