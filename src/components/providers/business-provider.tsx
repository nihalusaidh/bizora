"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAppStore } from "@/lib/store";

export function BusinessProvider({ children }: { children: React.ReactNode }) {
  const setBusiness = useAppStore((s) => s.setBusiness);

  useEffect(() => {
    const loadBusiness = async () => {
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
      }
    };

    loadBusiness();
  }, [setBusiness]);

  return <>{children}</>;
}
