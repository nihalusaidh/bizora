import { gstSchema, businessNameSchema, currencySchema, businessSizeSchema } from "@/lib/validators/onboarding";

describe("Onboarding Validators", () => {
  describe("businessNameSchema", () => {
    it("accepts valid name", () => {
      expect(businessNameSchema.safeParse({ business_name: "My Shop" }).success).toBe(true);
    });

    it("rejects short name", () => {
      expect(businessNameSchema.safeParse({ business_name: "A" }).success).toBe(false);
    });
  });

  describe("currencySchema", () => {
    it("accepts valid currency", () => {
      expect(currencySchema.safeParse({ currency: "INR", currency_symbol: "₹" }).success).toBe(true);
    });

    it("requires currency", () => {
      expect(currencySchema.safeParse({ currency: "", currency_symbol: "₹" }).success).toBe(false);
    });

    it("requires symbol", () => {
      expect(currencySchema.safeParse({ currency: "INR", currency_symbol: "" }).success).toBe(false);
    });
  });

  describe("gstSchema", () => {
    it("accepts unregistered business", () => {
      const result = gstSchema.safeParse({ gst_status: "unregistered" });
      expect(result.success).toBe(true);
    });

    it("accepts registered business with GSTIN", () => {
      const result = gstSchema.safeParse({ gst_status: "registered", gstin: "27AABCU9603R1ZM" });
      expect(result.success).toBe(true);
    });

    it("rejects registered business without GSTIN", () => {
      const result = gstSchema.safeParse({ gst_status: "registered", gstin: "" });
      expect(result.success).toBe(false);
    });
  });

  describe("businessSizeSchema", () => {
    it("accepts valid sizes", () => {
      ["solo", "small", "medium", "large"].forEach((size) => {
        expect(businessSizeSchema.safeParse({ business_size: size }).success).toBe(true);
      });
    });

    it("rejects invalid size", () => {
      expect(businessSizeSchema.safeParse({ business_size: "huge" }).success).toBe(false);
    });
  });
});
