import { productSchema, categorySchema, supplierSchema, productVariantSchema } from "@/lib/validators/inventory";

describe("Inventory Validators", () => {
  describe("productSchema", () => {
    const validProduct = {
      name: "Test Product",
      cost_price: 100,
      selling_price: 150,
      gst_rate: 18,
      min_stock: 10,
      has_variants: false,
      is_active: true,
    };

    it("accepts valid product", () => {
      expect(productSchema.safeParse(validProduct).success).toBe(true);
    });

    it("requires name", () => {
      expect(productSchema.safeParse({ ...validProduct, name: "" }).success).toBe(false);
    });

    it("rejects negative cost price", () => {
      expect(productSchema.safeParse({ ...validProduct, cost_price: -1 }).success).toBe(false);
    });

    it("rejects negative selling price", () => {
      expect(productSchema.safeParse({ ...validProduct, selling_price: -10 }).success).toBe(false);
    });

    it("rejects GST rate > 100", () => {
      expect(productSchema.safeParse({ ...validProduct, gst_rate: 101 }).success).toBe(false);
    });

    it("accepts optional fields", () => {
      const result = productSchema.safeParse({
        ...validProduct,
        sku: "SKU-001",
        barcode: "123456789",
        brand: "TestBrand",
        hsn_sac: "6109",
      });
      expect(result.success).toBe(true);
    });

    it("defaults gst_rate to 0", () => {
      const result = productSchema.safeParse({ name: "Test", cost_price: 0, selling_price: 0 });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.gst_rate).toBe(0);
    });
  });

  describe("categorySchema", () => {
    it("accepts valid category", () => {
      expect(categorySchema.safeParse({ name: "Electronics" }).success).toBe(true);
    });

    it("requires name", () => {
      expect(categorySchema.safeParse({ name: "" }).success).toBe(false);
    });

    it("rejects name > 100 chars", () => {
      expect(categorySchema.safeParse({ name: "x".repeat(101) }).success).toBe(false);
    });
  });

  describe("supplierSchema", () => {
    it("accepts valid supplier", () => {
      expect(supplierSchema.safeParse({ name: "Acme Corp" }).success).toBe(true);
    });

    it("requires name", () => {
      expect(supplierSchema.safeParse({ name: "" }).success).toBe(false);
    });

    it("accepts optional email", () => {
      expect(supplierSchema.safeParse({ name: "Acme", email: "acme@example.com" }).success).toBe(true);
    });

    it("rejects invalid email", () => {
      expect(supplierSchema.safeParse({ name: "Acme", email: "not-email" }).success).toBe(false);
    });
  });

  describe("productVariantSchema", () => {
    it("accepts valid variant", () => {
      expect(productVariantSchema.safeParse({ name: "Size M" }).success).toBe(true);
    });

    it("requires name", () => {
      expect(productVariantSchema.safeParse({ name: "" }).success).toBe(false);
    });
  });
});
