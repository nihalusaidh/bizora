import { createClient } from "@/lib/supabase/client";

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
  const supabase = createClient();
  const { data } = await supabase
    .from("loyalty_settings")
    .select("*")
    .eq("business_id", businessId)
    .single();

  if (data) return data as LoyaltySettings;

  const { data: created } = await supabase
    .from("loyalty_settings")
    .insert({ business_id: businessId, ...DEFAULT_SETTINGS } as never)
    .select()
    .single();

  return created as LoyaltySettings;
}

export async function updateLoyaltySettings(
  businessId: string,
  updates: Partial<Omit<LoyaltySettings, "id" | "business_id">>
) {
  const supabase = createClient();

  const { data: existing } = await supabase
    .from("loyalty_settings")
    .select("id")
    .eq("business_id", businessId)
    .single();

  if (existing) {
    const { error } = await supabase
      .from("loyalty_settings")
      .update(updates)
      .eq("business_id", businessId);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase
      .from("loyalty_settings")
      .insert({ business_id: businessId, ...DEFAULT_SETTINGS, ...updates } as never);
    if (error) throw new Error(error.message);
  }

  return { success: true };
}

export async function earnPoints(businessId: string, invoiceId: string, customerId: string, amount: number) {
  const settings = await getLoyaltySettings(businessId);
  if (!settings.enabled) return { pointsEarned: 0, message: "Loyalty program is disabled" };

  const points = Math.floor(amount / settings.earn_rate) * settings.earn_points;
  if (points <= 0) return { pointsEarned: 0, message: "Amount too low to earn points" };

  const supabase = createClient();

  const { error: insertError } = await supabase.from("loyalty_points").insert({
    business_id: businessId,
    customer_id: customerId,
    invoice_id: invoiceId,
    type: "earn",
    points,
    description: `Earned ${points} points for ₹${amount.toLocaleString("en-IN")} purchase`,
  });

  if (insertError) throw new Error(insertError.message);

  const { count } = await supabase
    .from("loyalty_points")
    .select("*", { count: "exact", head: true })
    .eq("customer_id", customerId)
    .eq("type", "earn");

  const { count: redeemCount } = await supabase
    .from("loyalty_points")
    .select("*", { count: "exact", head: true })
    .eq("customer_id", customerId)
    .eq("type", "redeem");

  const newBalance = (count || 0) - (redeemCount || 0);

  return { pointsEarned: points, newBalance };
}

export async function getLoyaltyBalance(customerId: string) {
  const supabase = createClient();

  const { count: earned } = await supabase
    .from("loyalty_points")
    .select("*", { count: "exact", head: true })
    .eq("customer_id", customerId)
    .eq("type", "earn");

  const { count: redeemed } = await supabase
    .from("loyalty_points")
    .select("*", { count: "exact", head: true })
    .eq("customer_id", customerId)
    .eq("type", "redeem");

  return (earned || 0) - (redeemed || 0);
}

export async function redeemPoints(
  businessId: string,
  customerId: string,
  points: number,
  invoiceId: string
) {
  const settings = await getLoyaltySettings(businessId);
  if (!settings.enabled) throw new Error("Loyalty program is disabled");

  if (points < settings.min_redeem_points) {
    throw new Error(`Minimum ${settings.min_redeem_points} points required to redeem`);
  }

  const balance = await getLoyaltyBalance(customerId);
  if (balance < points) {
    throw new Error(`Insufficient points. You have ${balance} points.`);
  }

  const discount = points * settings.redeem_rate;

  const supabase = createClient();
  const { error } = await supabase.from("loyalty_points").insert({
    business_id: businessId,
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
  const supabase = createClient();
  const { data, error } = await supabase
    .from("loyalty_points")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}
