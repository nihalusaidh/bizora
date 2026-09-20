import { requireAuth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function createBusiness(data: {
  name: string;
  type: string;
  currency: string;
  currency_symbol: string;
  gst_status: string;
  gstin: string | null;
  size: string;
}) {
  try {
    const auth = await requireAuth();
    if (auth.error || !auth.supabase || !auth.user) {
      return { error: "Not signed in. Please log in again, then retry setup." };
    }

    if (!data.name?.trim() || !data.type?.trim()) {
      return { error: "Business name and type are required." };
    }

    // Use admin client to bypass RLS for business creation
    const admin = createAdminClient();

    const { data: business, error: businessError } = await admin
      .from("businesses")
      .insert({
        name: data.name,
        type: data.type,
        currency: data.currency,
        currency_symbol: data.currency_symbol,
        gst_status: data.gst_status,
        gstin: data.gstin,
        size: data.size,
        owner_id: auth.user.id,
      })
      .select()
      .single();

    if (businessError || !business) {
      return { error: businessError?.message || "Failed to create business" };
    }

    const { error: membershipError } = await admin
      .from("memberships")
      .insert({
        user_id: auth.user.id,
        business_id: business.id,
        role: "owner",
      });

    if (membershipError) {
      return { error: membershipError?.message || "Failed to create membership" };
    }

    return { data: business };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Something went wrong";
    // Never leak raw client errors like "supabaseKey is required".
    if (/supabaseKey is required|supabaseUrl is required|API key/i.test(msg)) {
      return { error: "Server is misconfigured (database key missing). Contact support." };
    }
    return { error: msg };
  }
}
