import { customerSchema, customerPaymentSchema, customerCreditSchema } from "@/lib/validators/customers";

describe("Customer Validators", () => {
  describe("customerSchema", () => {
    it("accepts valid customer", () => {
      expect(customerSchema.safeParse({ name: "Rahul Sharma" }).success).toBe(true);
    });

    it("requires name", () => {
      expect(customerSchema.safeParse({ name: "" }).success).toBe(false);
    });

    it("accepts optional fields", () => {
      const result = customerSchema.safeParse({
        name: "Rahul",
        phone: "9876543210",
        email: "rahul@example.com",
        address: "Mumbai",
        gst_number: "27AABCU9603R1ZM",
      });
      expect(result.success).toBe(true);
    });

    it("defaults preferred_delivery to ask", () => {
      const result = customerSchema.safeParse({ name: "Test" });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.preferred_delivery).toBe("ask");
    });
  });

  describe("customerPaymentSchema", () => {
    it("accepts valid payment", () => {
      expect(customerPaymentSchema.safeParse({ amount: 500 }).success).toBe(true);
    });

    it("rejects zero amount", () => {
      expect(customerPaymentSchema.safeParse({ amount: 0 }).success).toBe(false);
    });

    it("rejects negative amount", () => {
      expect(customerPaymentSchema.safeParse({ amount: -100 }).success).toBe(false);
    });

    it("defaults payment_method to cash", () => {
      const result = customerPaymentSchema.safeParse({ amount: 100 });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.payment_method).toBe("cash");
    });

    it("accepts valid payment methods", () => {
      const methods = ["cash", "upi", "card", "bank_transfer", "other"];
      methods.forEach((m) => {
        expect(customerPaymentSchema.safeParse({ amount: 100, payment_method: m }).success).toBe(true);
      });
    });
  });

  describe("customerCreditSchema", () => {
    it("accepts valid credit", () => {
      expect(customerCreditSchema.safeParse({ amount: 1000 }).success).toBe(true);
    });

    it("rejects negative amount", () => {
      expect(customerCreditSchema.safeParse({ amount: -500 }).success).toBe(false);
    });
  });
});
