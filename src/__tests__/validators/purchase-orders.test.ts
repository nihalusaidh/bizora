import { purchaseOrderSchema, purchaseOrderItemSchema } from "@/lib/validators/purchase-orders";

describe("Purchase Order Validators", () => {
  const validItem = {
    name: "Raw Material",
    ordered_quantity: 100,
    unit_cost: 50,
    total: 5000,
  };

  describe("purchaseOrderItemSchema", () => {
    it("accepts valid item", () => {
      expect(purchaseOrderItemSchema.safeParse(validItem).success).toBe(true);
    });

    it("requires name", () => {
      expect(purchaseOrderItemSchema.safeParse({ ...validItem, name: "" }).success).toBe(false);
    });

    it("rejects zero quantity", () => {
      expect(purchaseOrderItemSchema.safeParse({ ...validItem, ordered_quantity: 0 }).success).toBe(false);
    });

    it("rejects negative cost", () => {
      expect(purchaseOrderItemSchema.safeParse({ ...validItem, unit_cost: -10 }).success).toBe(false);
    });
  });

  describe("purchaseOrderSchema", () => {
    it("accepts valid PO", () => {
      const result = purchaseOrderSchema.safeParse({
        supplier_id: "550e8400-e29b-41d4-a716-446655440000",
        items: [validItem],
      });
      expect(result.success).toBe(true);
    });

    it("requires valid supplier UUID", () => {
      expect(purchaseOrderSchema.safeParse({
        supplier_id: "not-a-uuid",
        items: [validItem],
      }).success).toBe(false);
    });

    it("requires at least one item", () => {
      expect(purchaseOrderSchema.safeParse({
        supplier_id: "550e8400-e29b-41d4-a716-446655440000",
        items: [],
      }).success).toBe(false);
    });
  });
});
