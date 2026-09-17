"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/lib/store";
import { resolvePlan } from "@/lib/entitlements";

export function BusinessProvider({ children }: { children: React.ReactNode }) {
  const setBusiness = useAppStore((s) => s.setBusiness);
  const setPlan = useAppStore((s) => s.setPlan);

  useEffect(() => {
    const loadBusiness = async () => {
      try {
        if (localStorage.getItem("bizora-demo") === "true") return;
      } catch {}
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: membership } = await supabase
        .from("memberships")
        .select("business_id")
        .eq("user_id", user.id)
        .limit(1)
        .single();

      if (!membership) return;

      const { data: business } = await supabase
        .from("businesses")
        .select("*")
        .eq("id", membership.business_id)
        .single();

      if (business) {
        setBusiness(business as never);
        const b = business as { plan?: unknown; plan_expires_at?: unknown };
        setPlan(resolvePlan(b.plan, b.plan_expires_at));
      }
    };

    loadBusiness();
  }, [setBusiness, setPlan]);

  return <>{children}</>;
}
