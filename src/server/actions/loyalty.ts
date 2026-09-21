"use server";

import { requireBusiness } from "@/lib/auth";

export interface LoyaltySettings {
  id: string;
  business_id: string;
  enabled: boolean;
  earn_rate: number;
  earn_points: number;
  redeem_rate: number;
  min_redeem_points: number;
  max_discount_percent: number;
  welcome_bonus: number;
}

const DEFAULT_SETTINGS: Omit<LoyaltySettings, "id" | "business_id"> = {
  enabled: false,
  earn_rate: 100,
  earn_points: 1,
  redeem_rate: 1,
  min_redeem_points: 10,
  max_discount_percent: 10,
  welcome_bonus: 0,
};

export async function getLoyaltySettings(businessId: string): Promise<LoyaltySettings> {
  const auth = await requireBusiness();
  if (auth.error || !auth.supabase || !auth.businessId) return {} as LoyaltySettings;
  const supabase = auth.supabase;
  const { data } = await supabase
    .from("loyalty_settings")
    .select("*")
    .eq("business_id", auth.businessId)
    .single();

  if (data) return data as LoyaltySettings;

  const { data: created } = await supabase
    .from("loyalty_settings")
    .insert({ business_id: auth.businessId, ...DEFAULT_SETTINGS } as never)
    .select()
    .single();

  return created as LoyaltySettings;
}

export async function updateLoyaltySettings(
  businessId: string,
  updates: Partial<Omit<LoyaltySettings, "id" | "business_id">>
) {
  const auth = await requireBusiness();
  if (auth.error || !auth.supabase || !auth.businessId) return { error: auth.error };
  const supabase = auth.supabase;

  const { data: existing } = await supabase
    .from("loyalty_settings")
    .select("id")
    .eq("business_id", auth.businessId)
    .single();

  if (existing) {
    const { error } = await supabase
      .from("loyalty_settings")
      .update(updates)
      .eq("business_id", auth.businessId);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from("loyalty_settings")
      .insert({ business_id: auth.businessId, ...DEFAULT_SETTINGS, ...updates } as never);
    if (error) throw new Error(error.message);
  }

  return { success: true };
}

export async function earnPoints(businessId: string, invoiceId: string, customerId: string, amount: number) {
  const auth = await requireBusiness();
  if (auth.error || !auth.supabase || !auth.businessId) return { error: auth.error };
  const supabase = auth.supabase;

  const settings = await getLoyaltySettings(auth.businessId);
  if (!settings.enabled) return { pointsEarned: 0, message: "Loyalty program is disabled" };

  const points = Math.floor(amount / settings.earn_rate) * settings.earn_points;
  if (points <= 0) return { pointsEarned: 0, message: "Amount too low to earn points" };

  const { error: insertError } = await supabase.from("loyalty_points").insert({
    business_id: auth.businessId,
    customer_id: customerId,
    invoice_id: invoiceId,
    type: "earn",
    points,
    description: `Earned ${points} points for ₹${amount.toLocaleString("en-IN")} purchase`,
  });

  if (insertError) throw new Error(insertError.message);

  const { data: pointsData } = await supabase
    .from("loyalty_points")
    .select("type, points")
    .eq("customer_id", customerId);

  const newBalance = (pointsData || []).reduce((sum, p) =>
    p.type === "earn" ? sum + p.points : sum - p.points, 0
  );

  return { pointsEarned: points, newBalance };
}

export async function getLoyaltyBalance(customerId: string) {
  const auth = await requireBusiness();
  if (auth.error || !auth.supabase || !auth.businessId) return { error: auth.error };
  const supabase = auth.supabase;

  const { data } = await supabase
    .from("loyalty_points")
    .select("type, points")
    .eq("customer_id", customerId)
    .eq("business_id", auth.businessId);

  const balance = (data || []).reduce((sum, p) =>
    p.type === "earn" ? sum + p.points : sum - p.points, 0
  );

  return balance;
}

export async function redeemPoints(
  businessId: string,
  customerId: string,
  points: number,
  invoiceId: string
) {
  const auth = await requireBusiness();
  if (auth.error || !auth.supabase || !auth.businessId) return { error: auth.error };
  const supabase = auth.supabase;

  const settings = await getLoyaltySettings(auth.businessId);
  if (!settings.enabled) throw new Error("Loyalty program is disabled");

  if (points < settings.min_redeem_points) {
    throw new Error(`Minimum ${settings.min_redeem_points} points required to redeem`);
  }

  const balance = await getLoyaltyBalance(customerId) as number;
  if (balance < points) {
    throw new Error(`Insufficient points. You have ${balance} points.`);
  }

  const discount = points * settings.redeem_rate;

  const { error } = await supabase.from("loyalty_points").insert({
    business_id: auth.businessId,
    customer_id: customerId,
    invoice_id: invoiceId,
    type: "redeem",
    points,
    description: `Redeemed ${points} points for ₹${discount} discount`,
  });

  if (error) throw new Error(error.message);

  return { discount, newBalance: balance - points };
}

export async function getLoyaltyHistory(customerId: string) {
  const auth = await requireBusiness();
  if (auth.error || !auth.supabase || !auth.businessId) return { error: auth.error };
  const supabase = auth.supabase;
  const { data, error } = await supabase
    .from("loyalty_points")
    .select("*")
    .eq("customer_id", customerId)
    .eq("business_id", auth.businessId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}
