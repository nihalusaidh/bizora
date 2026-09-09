import type { PlanTier } from "@/types/database";

export type Platform = "mobile" | "web" | "desktop";

interface PlanFeature {
  label: string;
  max?: number;
  unlimited?: boolean;
}

interface PlanConfig {
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  maxProducts: number;
  maxCustomers: number;
  maxInvoicesPerMonth: number;
  aiQueriesPerMonth: number;
  multiBranch: boolean;
  apiAccess: boolean;
  whiteLabel: boolean;
  desktopDownload: boolean;
}

export const PLAN_CONFIGS: Record<PlanTier, PlanConfig> = {
  free: {
    name: "Free",
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      "50 invoices/month",
      "Up to 50 products",
      "Basic billing & POS",
      "Basic inventory",
      "Basic expenses",
      "Basic reports",
    ],
    maxProducts: 50,
    maxCustomers: 100,
    maxInvoicesPerMonth: 50,
    aiQueriesPerMonth: 0,
    multiBranch: false,
    apiAccess: false,
    whiteLabel: false,
    desktopDownload: false,
  },
  gold: {
    name: "Gold",
    monthlyPrice: 399,
    yearlyPrice: 3990,
    features: [
      "Unlimited invoices",
      "Unlimited products",
      "Advanced inventory",
      "Business Intelligence",
      "AI Copilot (50 queries)",
      "Customer Intelligence",
      "Smart Discount Advisor",
      "Priority support",
    ],
    maxProducts: Infinity,
    maxCustomers: Infinity,
    maxInvoicesPerMonth: Infinity,
    aiQueriesPerMonth: 50,
    multiBranch: false,
    apiAccess: false,
    whiteLabel: false,
    desktopDownload: true,
  },
  diamond: {
    name: "Diamond",
    monthlyPrice: 699,
    yearlyPrice: 6990,
    features: [
      "Everything in Gold",
      "Unlimited AI queries",
      "Multi-branch support",
      "Business Simulator",
      "Advanced forecasting",
      "API access",
      "Dedicated support",
      "White-label option",
    ],
    maxProducts: Infinity,
    maxCustomers: Infinity,
    maxInvoicesPerMonth: Infinity,
    aiQueriesPerMonth: Infinity,
    multiBranch: true,
    apiAccess: true,
    whiteLabel: true,
    desktopDownload: true,
  },
};

const PLAN_ORDER: Record<PlanTier, number> = {
  free: 0,
  gold: 1,
  diamond: 2,
};

export function isPlanAtLeast(current: PlanTier, required: PlanTier): boolean {
  return PLAN_ORDER[current] >= PLAN_ORDER[required];
}

export function hasFeature(plan: PlanTier, feature: string): boolean {
  const config = PLAN_CONFIGS[plan];

  const featureMap: Record<string, boolean> = {
    "basic-billing": true,
    "basic-inventory": true,
    "basic-expenses": true,
    "basic-reports": true,
    "advanced-inventory": isPlanAtLeast(plan, "gold"),
    "business-intelligence": isPlanAtLeast(plan, "gold"),
    "ai-copilot": isPlanAtLeast(plan, "gold"),
    "customer-intelligence": isPlanAtLeast(plan, "gold"),
    "smart-discount": isPlanAtLeast(plan, "gold"),
    "profit-leak-detector": isPlanAtLeast(plan, "gold"),
    "dead-capital-detector": isPlanAtLeast(plan, "gold"),
    "smart-bundles": isPlanAtLeast(plan, "gold"),
    "missed-revenue": isPlanAtLeast(plan, "gold"),
    "stock-forecasting": isPlanAtLeast(plan, "gold"),
    "multi-branch": isPlanAtLeast(plan, "diamond"),
    "business-simulator": isPlanAtLeast(plan, "diamond"),
    "business-twin": isPlanAtLeast(plan, "diamond"),
    "opportunity-radar": isPlanAtLeast(plan, "diamond"),
    "advanced-forecasting": isPlanAtLeast(plan, "diamond"),
    "api-access": isPlanAtLeast(plan, "diamond"),
    "white-label": isPlanAtLeast(plan, "diamond"),
    "approval-workflows": isPlanAtLeast(plan, "diamond"),
    "advanced-audit-logs": isPlanAtLeast(plan, "diamond"),
  };

  return featureMap[feature] ?? false;
}

export function canDownloadDesktop(plan: PlanTier): boolean {
  return PLAN_CONFIGS[plan].desktopDownload;
}

export function getAvailablePlans(platform: Platform): PlanTier[] {
  if (platform === "mobile") {
    return ["free", "gold"];
  }
  return ["free", "gold", "diamond"];
}

export function getPlanFeatures(plan: PlanTier): string[] {
  return PLAN_CONFIGS[plan].features;
}

export function getUpgradeRequired(
  currentPlan: PlanTier,
  feature: string
): PlanTier | null {
  if (hasFeature(currentPlan, feature)) return null;

  if (feature.startsWith("multi-") || feature.startsWith("business-sim") || feature.startsWith("advanced-") || feature === "api-access" || feature === "white-label" || feature === "approval-workflows" || feature === "advanced-audit-logs") {
    return "diamond";
  }
  return "gold";
}
