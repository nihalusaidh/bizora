"use client";

import { useEffect, useState } from "react";
import { getCurrentUserRole } from "@/server/actions/team";
import { hasPermission, hasAnyPermission } from "@/lib/rbac";
import { useBusiness } from "@/lib/store";
import type { UserRole } from "@/types/database";

export function useUserRole() {
  const { businessId } = useBusiness();
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!businessId) {
        setLoading(false);
        return;
      }
      try {
        const r = await getCurrentUserRole(businessId);
        setRole(r);
      } catch {
        setRole(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [businessId]);

  const can = (permission: string) => role !== null && hasPermission(role, permission);
  const canAny = (permissions: string[]) => role !== null && hasAnyPermission(role, permissions);

  return { role, loading, can, canAny };
}
