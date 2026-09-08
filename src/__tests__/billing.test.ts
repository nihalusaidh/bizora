import { calculateItemTotal, calculateInvoiceTotals, type CartItem } from "@/lib/billing";

function makeItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    productId: "p1",
    variantId: null,
    name: "Test Item",
    sku: null,
    quantity: 1,
    unit: "pc",
    unitPrice: 100,
    costPrice: 50,
    discountPercent: 0,
    taxRate: 18,
    stockQuantity: 100,
    ...overrides,
  };
}

describe("billing utilities", () => {
  describe("calculateItemTotal", () => {
    it("calculates basic item total without discount or tax", () => {
      const item = makeItem({ unitPrice: 100, quantity: 2, discountPercent: 0, taxRate: 0 });
      const result = calculateItemTotal(item);
      expect(result.base).toBe(200);
      expect(result.discountAmt).toBe(0);
      expect(result.taxAmt).toBe(0);
      expect(result.total).toBe(200);
    });

    it("calculates item with discount", () => {
      const item = makeItem({ unitPrice: 100, quantity: 2, discountPercent: 10, taxRate: 0 });
      const result = calculateItemTotal(item);
      expect(result.base).toBe(200);
      expect(result.discountAmt).toBe(20);
      expect(result.total).toBe(180);
    });

    it("calculates item with tax", () => {
      const item = makeItem({ unitPrice: 100, quantity: 1, discountPercent: 0, taxRate: 18 });
      const result = calculateItemTotal(item);
      expect(result.base).toBe(100);
      expect(result.taxAmt).toBe(18);
      expect(result.total).toBe(118);
    });

    it("calculates item with both discount and tax", () => {
      const item = makeItem({ unitPrice: 200, quantity: 3, discountPercent: 10, taxRate: 18 });
      const result = calculateItemTotal(item);
      expect(result.base).toBe(600);
      expect(result.discountAmt).toBe(60);
      expect(result.taxAmt).toBe(97.2);
      expect(result.total).toBe(637.2);
    });
  });

  describe("calculateInvoiceTotals", () => {
    it("calculates totals for single item", () => {
      const items = [makeItem({ unitPrice: 100, quantity: 1, taxRate: 18 })];
      const result = calculateInvoiceTotals(items);
      expect(result.subtotal).toBe(100);
      expect(result.totalTax).toBe(18);
      expect(result.grandTotal).toBe(118);
    });

    it("calculates totals for multiple items", () => {
      const items = [
        makeItem({ unitPrice: 100, quantity: 2, taxRate: 18 }),
        makeItem({ unitPrice: 50, quantity: 3, taxRate: 12 }),
      ];
      const result = calculateInvoiceTotals(items);
      expect(result.subtotal).toBe(350); // 200 + 150
      expect(result.totalTax).toBe(54); // 36 + 18
    });

    it("applies global percentage discount", () => {
      const items = [makeItem({ unitPrice: 1000, quantity: 1, taxRate: 0 })];
      const result = calculateInvoiceTotals(items, 10, 0);
      expect(result.subtotal).toBe(1000);
      expect(result.totalDiscount).toBe(100);
      expect(result.grandTotal).toBe(900);
    });

    it("applies global fixed discount", () => {
      const items = [makeItem({ unitPrice: 1000, quantity: 1, taxRate: 0 })];
      const result = calculateInvoiceTotals(items, 0, 150);
      expect(result.subtotal).toBe(1000);
      expect(result.totalDiscount).toBe(150);
      expect(result.grandTotal).toBe(850);
    });

    it("rounds off correctly", () => {
      const items = [makeItem({ unitPrice: 100, quantity: 1, taxRate: 18 })];
      const result = calculateInvoiceTotals(items);
      expect(result.grandTotal).toBe(118);
      expect(result.roundOff).toBe(0);
    });

    it("handles empty cart", () => {
      const result = calculateInvoiceTotals([]);
      expect(result.subtotal).toBe(0);
      expect(result.totalTax).toBe(0);
      expect(result.grandTotal).toBe(0);
    });
  });
});
