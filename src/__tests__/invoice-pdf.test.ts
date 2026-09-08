import { generateInvoiceHtml, type InvoicePdfData } from "@/lib/invoice-pdf";

const mockInvoice: InvoicePdfData = {
  invoice_number: "INV-2024-001",
  created_at: "2024-01-15T10:30:00Z",
  status: "paid",
  subtotal: 1000,
  discount_amount: 100,
  tax_amount: 162,
  round_off: 0,
  total: 1062,
  amount_paid: 1062,
  payment_method: "upi",
  notes: "Thank you for your business",
  business: {
    name: "Test Business",
    address: "123 Main St, Mumbai",
    phone: "+919876543210",
    email: "test@business.com",
    gst_status: "registered",
    gstin: "27AABCU9603R1ZM",
  },
  customer: {
    name: "Rahul Sharma",
    phone: "+919876543211",
    email: "rahul@customer.com",
    address: "456 Park Rd, Delhi",
    gst_number: "07AADCB2230M1ZT",
  },
  items: [
    {
      name: "Widget A",
      sku: "WA001",
      quantity: 5,
      unit: "pc",
      unit_price: 100,
      discount_percent: 10,
      tax_rate: 18,
      tax_amount: 81,
      total: 459,
    },
    {
      name: "Widget B",
      quantity: 2,
      unit: "pc",
      unit_price: 250,
      discount_percent: 0,
      tax_rate: 18,
      tax_amount: 90,
      total: 590,
    },
  ],
};

describe("invoice-pdf", () => {
  describe("generateInvoiceHtml", () => {
    it("generates valid HTML", () => {
      const html = generateInvoiceHtml(mockInvoice);
      expect(html).toContain("<!DOCTYPE html>");
      expect(html).toContain("</html>");
    });

    it("includes business information", () => {
      const html = generateInvoiceHtml(mockInvoice);
      expect(html).toContain("Test Business");
      expect(html).toContain("123 Main St, Mumbai");
      expect(html).toContain("+919876543210");
      expect(html).toContain("27AABCU9603R1ZM");
    });

    it("includes customer information", () => {
      const html = generateInvoiceHtml(mockInvoice);
      expect(html).toContain("Rahul Sharma");
      expect(html).toContain("+919876543211");
    });

    it("includes invoice items", () => {
      const html = generateInvoiceHtml(mockInvoice);
      expect(html).toContain("Widget A");
      expect(html).toContain("Widget B");
      expect(html).toContain("WA001");
    });

    it("includes financial totals", () => {
      const html = generateInvoiceHtml(mockInvoice);
      expect(html).toContain("1062.00");
      expect(html).toContain("100.00");
    });

    it("includes invoice number and status", () => {
      const html = generateInvoiceHtml(mockInvoice);
      expect(html).toContain("INV-2024-001");
      expect(html).toContain("PAID");
    });

    it("includes notes", () => {
      const html = generateInvoiceHtml(mockInvoice);
      expect(html).toContain("Thank you for your business");
    });

    it("handles walk-in customer", () => {
      const walkInInvoice = { ...mockInvoice, customer: null };
      const html = generateInvoiceHtml(walkInInvoice);
      expect(html).toContain("Walk-in Customer");
    });

    it("hides discount when zero", () => {
      const noDiscountInvoice = { ...mockInvoice, discount_amount: 0 };
      const html = generateInvoiceHtml(noDiscountInvoice);
      expect(html).not.toContain("Discount");
    });

    it("hides GST row when zero", () => {
      const noTaxInvoice = { ...mockInvoice, tax_amount: 0 };
      const html = generateInvoiceHtml(noTaxInvoice);
      // The totals section should not show a GST row
      expect(html).not.toMatch(/<span>GST<\/span>\s*<span>₹0/);
    });
  });
});
