import {
  PLAN_CONFIGS,
  isPlanAtLeast,
  hasFeature,
  canDownloadDesktop,
  getAvailablePlans,
  getPlanFeatures,
  getUpgradeRequired,
} from "@/lib/entitlements";

describe("Entitlements", () => {
  describe("isPlanAtLeast", () => {
    it("free >= free", () => expect(isPlanAtLeast("free", "free")).toBe(true));
    it("gold >= free", () => expect(isPlanAtLeast("gold", "free")).toBe(true));
    it("diamond >= gold", () => expect(isPlanAtLeast("diamond", "gold")).toBe(true));
    it("free < gold", () => expect(isPlanAtLeast("free", "gold")).toBe(false));
    it("free < diamond", () => expect(isPlanAtLeast("free", "diamond")).toBe(false));
    it("gold < diamond", () => expect(isPlanAtLeast("gold", "diamond")).toBe(false));
  });

  describe("hasFeature", () => {
    it("free has basic-billing", () => expect(hasFeature("free", "basic-billing")).toBe(true));
    it("free has basic-inventory", () => expect(hasFeature("free", "basic-inventory")).toBe(true));
    it("free lacks ai-copilot", () => expect(hasFeature("free", "ai-copilot")).toBe(false));
    it("free lacks multi-branch", () => expect(hasFeature("free", "multi-branch")).toBe(false));
    it("gold has ai-copilot", () => expect(hasFeature("gold", "ai-copilot")).toBe(true));
    it("gold has customer-intelligence", () => expect(hasFeature("gold", "customer-intelligence")).toBe(true));
    it("gold lacks multi-branch", () => expect(hasFeature("gold", "multi-branch")).toBe(false));
    it("gold lacks api-access", () => expect(hasFeature("gold", "api-access")).toBe(false));
    it("diamond has multi-branch", () => expect(hasFeature("diamond", "multi-branch")).toBe(true));
    it("diamond has api-access", () => expect(hasFeature("diamond", "api-access")).toBe(true));
    it("diamond has white-label", () => expect(hasFeature("diamond", "white-label")).toBe(true));
    it("returns false for unknown feature", () => expect(hasFeature("free", "nonexistent")).toBe(false));
  });

  describe("canDownloadDesktop", () => {
    it("free cannot download", () => expect(canDownloadDesktop("free")).toBe(false));
    it("gold can download", () => expect(canDownloadDesktop("gold")).toBe(true));
    it("diamond can download", () => expect(canDownloadDesktop("diamond")).toBe(true));
  });

  describe("getAvailablePlans", () => {
    it("mobile gets free + gold only", () => {
      expect(getAvailablePlans("mobile")).toEqual(["free", "gold"]);
    });
    it("web gets all three", () => {
      expect(getAvailablePlans("web")).toEqual(["free", "gold", "diamond"]);
    });
    it("desktop gets all three", () => {
      expect(getAvailablePlans("desktop")).toEqual(["free", "gold", "diamond"]);
    });
  });

  describe("getPlanFeatures", () => {
    it("returns features for each plan", () => {
      expect(getPlanFeatures("free").length).toBeGreaterThan(0);
      expect(getPlanFeatures("gold").length).toBeGreaterThan(0);
      expect(getPlanFeatures("diamond").length).toBeGreaterThan(0);
    });

    it("diamond has more features than free", () => {
      expect(getPlanFeatures("diamond").length).toBeGreaterThan(getPlanFeatures("free").length);
    });
  });

  describe("getUpgradeRequired", () => {
    it("returns null when feature is available", () => {
      expect(getUpgradeRequired("gold", "ai-copilot")).toBeNull();
    });

    it("returns gold for basic advanced feature", () => {
      expect(getUpgradeRequired("free", "ai-copilot")).toBe("gold");
    });

    it("returns diamond for diamond-only feature", () => {
      expect(getUpgradeRequired("free", "multi-branch")).toBe("diamond");
      expect(getUpgradeRequired("free", "api-access")).toBe("diamond");
      expect(getUpgradeRequired("free", "white-label")).toBe("diamond");
    });

    it("returns gold for gold features on free plan", () => {
      expect(getUpgradeRequired("free", "business-intelligence")).toBe("gold");
    });
  });

  describe("PLAN_CONFIGS", () => {
    it("free plan is free", () => {
      expect(PLAN_CONFIGS.free.monthlyPrice).toBe(0);
      expect(PLAN_CONFIGS.free.yearlyPrice).toBe(0);
    });

    it("gold plan prices", () => {
      expect(PLAN_CONFIGS.gold.monthlyPrice).toBe(399);
      expect(PLAN_CONFIGS.gold.yearlyPrice).toBe(3990);
    });

    it("diamond plan prices", () => {
      expect(PLAN_CONFIGS.diamond.monthlyPrice).toBe(699);
      expect(PLAN_CONFIGS.diamond.yearlyPrice).toBe(6990);
    });

    it("gold yearly is cheaper than 12x monthly", () => {
      expect(PLAN_CONFIGS.gold.yearlyPrice).toBeLessThan(PLAN_CONFIGS.gold.monthlyPrice * 12);
    });
  });
});
