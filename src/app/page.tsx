import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function RootPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: memberships } = await supabase
      .from("memberships")
      .select("business_id")
      .eq("user_id", user.id)
      .limit(1);

    if (memberships && memberships.length > 0) {
      redirect("/dashboard");
    } else {
      redirect("/onboarding");
    }
  }

  // For unauthenticated: the (public) layout handles rendering
  // This page just handles auth redirect logic
  // Return empty - (public)/page.tsx content renders at /
  return null;
}
