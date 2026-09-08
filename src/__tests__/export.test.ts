import {
  formatProductsForCsv,
  formatCustomersForCsv,
  formatInvoicesForCsv,
  formatExpensesForCsv,
} from "@/lib/export";

describe("export utilities", () => {
  describe("formatProductsForCsv", () => {
    it("formats products correctly", () => {
      const products = [
        {
          name: "Test Product",
          sku: "TP001",
          barcode: "123456",
          brand: "Test Brand",
          category: { name: "Electronics" },
          cost_price: 100,
          selling_price: 150,
          gst_rate: 18,
          stock_quantity: 50,
          min_stock: 10,
          is_active: true,
        },
      ];

      const result = formatProductsForCsv(products);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        Name: "Test Product",
        SKU: "TP001",
        Barcode: "123456",
        Brand: "Test Brand",
        Category: "Electronics",
        "Cost Price": 100,
        "Selling Price": 150,
        "GST Rate": 18,
        Stock: 50,
        "Min Stock": 10,
        Active: "Yes",
      });
    });

    it("handles missing optional fields", () => {
      const products = [
        {
          name: "Simple Product",
          selling_price: 100,
          cost_price: 50,
          gst_rate: 0,
          stock_quantity: 10,
          is_active: false,
        },
      ];

      const result = formatProductsForCsv(products);
      expect(result[0].SKU).toBe("");
      expect(result[0].Barcode).toBe("");
      expect(result[0].Brand).toBe("");
      expect(result[0].Category).toBe("");
      expect(result[0].Active).toBe("No");
    });
  });

  describe("formatCustomersForCsv", () => {
    it("formats customers correctly", () => {
      const customers = [
        {
          name: "Rahul Sharma",
          phone: "+919876543210",
          email: "rahul@test.com",
          address: "Mumbai",
          gst_number: "27AABCU9603R1ZM",
          outstanding_balance: 500,
          total_spend: 10000,
          purchase_count: 5,
          preferred_delivery: "express",
          notes: "VIP customer",
        },
      ];

      const result = formatCustomersForCsv(customers);
      expect(result).toHaveLength(1);
      expect(result[0].Name).toBe("Rahul Sharma");
      expect(result[0].Phone).toBe("+919876543210");
      expect(result[0]["Outstanding Balance"]).toBe(500);
    });
  });

  describe("formatInvoicesForCsv", () => {
    it("formats invoices with balance calculation", () => {
      const invoices = [
        {
          invoice_number: "INV-001",
          created_at: "2024-01-15T10:30:00Z",
          customers: { name: "Test Customer" },
          status: "partial",
          subtotal: 1000,
          discount_amount: 100,
          tax_amount: 162,
          total: 1062,
          amount_paid: 500,
          payment_method: "cash",
        },
      ];

      const result = formatInvoicesForCsv(invoices);
      expect(result).toHaveLength(1);
      expect(result[0]["Invoice Number"]).toBe("INV-001");
      expect(result[0].Balance).toBe(562);
      expect(result[0].Customer).toBe("Test Customer");
    });

    it("handles walk-in customers", () => {
      const invoices = [
        {
          invoice_number: "INV-002",
          created_at: "2024-01-15T10:30:00Z",
          customers: null,
          status: "paid",
          subtotal: 500,
          discount_amount: 0,
          tax_amount: 0,
          total: 500,
          amount_paid: 500,
          payment_method: "upi",
        },
      ];

      const result = formatInvoicesForCsv(invoices);
      expect(result[0].Customer).toBe("Walk-in");
    });
  });

  describe("formatExpensesForCsv", () => {
    it("formats expenses correctly", () => {
      const expenses = [
        {
          expense_date: "2024-01-15",
          description: "Office rent",
          expense_categories: { name: "Rent" },
          amount: 25000,
          payment_method: "bank_transfer",
          vendor: "Landlord Corp",
          reference: "REF-001",
          notes: "Monthly rent",
          is_recurring: true,
          recurring_period: "monthly",
        },
      ];

      const result = formatExpensesForCsv(expenses);
      expect(result).toHaveLength(1);
      expect(result[0].Description).toBe("Office rent");
      expect(result[0].Category).toBe("Rent");
      expect(result[0].Recurring).toBe("Yes");
      expect(result[0]["Recurring Period"]).toBe("monthly");
    });
  });
});
