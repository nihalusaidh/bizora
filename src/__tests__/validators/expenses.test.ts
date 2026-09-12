import { expenseSchema, expenseCategorySchema } from "@/lib/validators/expenses";

describe("Expense Validators", () => {
  const validExpense = {
    description: "Office rent",
    amount: 15000,
    expense_date: "2026-09-01",
  };

  describe("expenseSchema", () => {
    it("accepts valid expense", () => {
      expect(expenseSchema.safeParse(validExpense).success).toBe(true);
    });

    it("requires description", () => {
      expect(expenseSchema.safeParse({ ...validExpense, description: "" }).success).toBe(false);
    });

    it("requires positive amount", () => {
      expect(expenseSchema.safeParse({ ...validExpense, amount: 0 }).success).toBe(false);
    });

    it("rejects negative amount", () => {
      expect(expenseSchema.safeParse({ ...validExpense, amount: -500 }).success).toBe(false);
    });

    it("requires date", () => {
      expect(expenseSchema.safeParse({ ...validExpense, expense_date: "" }).success).toBe(false);
    });

    it("defaults payment_method to cash", () => {
      const result = expenseSchema.safeParse(validExpense);
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.payment_method).toBe("cash");
    });

    it("defaults is_recurring to false", () => {
      const result = expenseSchema.safeParse(validExpense);
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.is_recurring).toBe(false);
    });
  });

  describe("expenseCategorySchema", () => {
    it("accepts valid category", () => {
      expect(expenseCategorySchema.safeParse({ name: "Rent" }).success).toBe(true);
    });

    it("requires name", () => {
      expect(expenseCategorySchema.safeParse({ name: "" }).success).toBe(false);
    });
  });
});
