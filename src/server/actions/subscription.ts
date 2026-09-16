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
