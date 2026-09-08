import { create } from "zustand";
import type { Business, PlanTier } from "@/types/database";

interface AppState {
  business: Business | null;
  plan: PlanTier;
  setBusiness: (business: Business | null) => void;
  setPlan: (plan: PlanTier) => void;
}

export const useAppStore = create<AppState>((set) => ({
  business: null,
  plan: "free",
  setBusiness: (business) => set({ business }),
  setPlan: (plan) => set({ plan }),
}));

export function useBusiness() {
  const business = useAppStore((s) => s.business);
  return { businessId: business?.id ?? null, business };
}
