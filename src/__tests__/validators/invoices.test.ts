import { invoiceSchema, invoiceItemSchema } from "@/lib/validators/invoices";

describe("Invoice Validators", () => {
  const validItem = {
    name: "Product A",
    quantity: 2,
    unit_price: 100,
    total: 200,
  };

  describe("invoiceItemSchema", () => {
    it("accepts valid item", () => {
      expect(invoiceItemSchema.safeParse(validItem).success).toBe(true);
    });

    it("requires name", () => {
      expect(invoiceItemSchema.safeParse({ ...validItem, name: "" }).success).toBe(false);
    });

    it("rejects zero quantity", () => {
      expect(invoiceItemSchema.safeParse({ ...validItem, quantity: 0 }).success).toBe(false);
    });

    it("rejects negative quantity", () => {
      expect(invoiceItemSchema.safeParse({ ...validItem, quantity: -1 }).success).toBe(false);
    });

    it("rejects negative price", () => {
      expect(invoiceItemSchema.safeParse({ ...validItem, unit_price: -50 }).success).toBe(false);
    });

    it("defaults unit to pc", () => {
      const result = invoiceItemSchema.safeParse(validItem);
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.unit).toBe("pc");
    });
  });

  describe("invoiceSchema", () => {
    it("accepts valid invoice", () => {
      const result = invoiceSchema.safeParse({
        items: [validItem],
      });
      expect(result.success).toBe(true);
    });

    it("requires at least one item", () => {
      expect(invoiceSchema.safeParse({ items: [] }).success).toBe(false);
    });

    it("defaults discount to 0", () => {
      const result = invoiceSchema.safeParse({ items: [validItem] });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.discount_amount).toBe(0);
        expect(result.data.discount_percent).toBe(0);
      }
    });

    it("accepts multiple items", () => {
      const result = invoiceSchema.safeParse({
        items: [validItem, { ...validItem, name: "Product B", total: 300 }],
      });
      expect(result.success).toBe(true);
    });
  });
});
