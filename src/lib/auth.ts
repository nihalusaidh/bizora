import { createClient } from "@/lib/supabase/server";

export async function requireAuth() {
  // Server client (request cookies) — requireAuth only runs inside
  // server actions / routes, never in the browser.
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return { supabase: null, user: null, error: "Not authenticated" as string | null };
  }

  return { supabase, user, error: null };
}

export async function requireBusiness() {
  const auth = await requireAuth();
  if (auth.error || !auth.supabase || !auth.user) {
    return { supabase: null, user: null, businessId: null, error: auth.error };
  }

  const { data: membership } = await auth.supabase
    .from("memberships")
    .select("business_id, role")
    .eq("user_id", auth.user.id)
    .limit(1)
    .single();

  if (!membership) {
    return { supabase: null, user: null, businessId: null, error: "No business found" as string | null };
  }

  return { supabase: auth.supabase, user: auth.user, businessId: membership.business_id, error: null };
}
