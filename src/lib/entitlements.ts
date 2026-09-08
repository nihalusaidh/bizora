import { PLAN_FEATURES, PLAN_LIMITS } from "./constants";
import type { PlanTier } from "@/types/database";

export function hasFeature(plan: PlanTier, feature: string): boolean {
  const tierOrder: PlanTier[] = ["free", "pro", "advanced"];
  const planIndex = tierOrder.indexOf(plan);

  for (let i = planIndex; i < tierOrder.length; i++) {
    const features = PLAN_FEATURES[tierOrder[i]] as readonly string[];
    if (features.includes(feature)) return true;
  }
  return false;
}

export function checkLimit(
  plan: PlanTier,
  resource: "products" | "customers" | "staff" | "branches",
  currentCount: number
): { allowed: boolean; limit: number; remaining: number } {
  const limit = PLAN_LIMITS[plan][resource];
  return {
    allowed: currentCount < limit,
    limit: limit === Infinity ? -1 : limit,
    remaining: limit === Infinity ? -1 : Math.max(0, limit - currentCount),
  };
}

export function getPlanFeatures(plan: PlanTier): readonly string[] {
  return PLAN_FEATURES[plan] || PLAN_FEATURES.free;
}
