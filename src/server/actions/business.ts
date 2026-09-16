import { requireAuth } from "@/lib/auth";

export async function createBusiness(data: {
  name: string;
  type: string;
  currency: string;
  currency_symbol: string;
  gst_status: string;
  gstin: string | null;
  size: string;
}) {
  const auth = await requireAuth();
  if (auth.error || !auth.supabase) {
    return { error: auth.error };
  }
  const supabase = auth.supabase;

  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .insert({
      name: data.name,
      type: data.type,
      currency: data.currency,
      currency_symbol: data.currency_symbol,
      gst_status: data.gst_status,
      gstin: data.gstin,
      size: data.size,
      owner_id: auth.user!.id,
    })
    .select()
    .single();

  if (businessError || !business) {
    return { error: businessError?.message || "Failed to create business" };
  }

  const { error: membershipError } = await supabase
    .from("memberships")
    .insert({
      user_id: auth.user!.id,
      business_id: business.id,
      role: "owner",
    });

  if (membershipError) {
    return { error: membershipError?.message || "Failed to create membership" };
  }

  return { data: business };
}
