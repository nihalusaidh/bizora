"use server";

import { requireBusiness } from "@/lib/auth";

const VALID_COUPONS: Record<string, { plan: string; duration: number }> = {
  "bizora@abu": { plan: "diamond", duration: 365 },
};

export async function applyCoupon(couponCode: string) {
  const auth = await requireBusiness();
  if (auth.error || !auth.supabase || !auth.businessId) return { error: auth.error };
  const supabase = auth.supabase;

  const coupon = VALID_COUPONS[couponCode.toLowerCase().trim()];
  if (!coupon) return { error: "Invalid coupon code" };

  const { error } = await supabase
    .from("businesses")
    .update({
      plan: coupon.plan,
      plan_expires_at: new Date(Date.now() + coupon.duration * 86400000).toISOString(),
    })
    .eq("id", auth.businessId);

  if (error) return { error: error.message };
  return { success: true, plan: coupon.plan };
}

/** Source of truth for the current plan — used by the app to auto-detect upgrades bought on the website. */
export async function getCurrentPlan() {
  const auth = await requireBusiness();
  if (auth.error || !auth.supabase || !auth.businessId) return { error: auth.error || "Not authenticated" };
  const { data, error } = await auth.supabase
    .from("businesses")
    .select("plan, plan_expires_at")
    .eq("id", auth.businessId)
    .single();
  if (error || !data) return { error: error?.message || "Business not found" };
  const { resolvePlan } = await import("@/lib/entitlements");
  return { plan: resolvePlan((data as { plan: unknown }).plan, (data as { plan_expires_at: unknown }).plan_expires_at) };
}
