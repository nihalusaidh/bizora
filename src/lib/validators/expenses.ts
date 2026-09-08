import { z } from "zod";

export const expenseCategorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(100),
  icon: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
});

export type ExpenseCategoryInput = z.infer<typeof expenseCategorySchema>;

export const expenseSchema = z.object({
  category_id: z.string().uuid().optional().nullable(),
  description: z.string().min(1, "Description is required").max(500),
  amount: z.coerce.number().positive("Amount must be positive"),
  payment_method: z.enum(["cash", "upi", "card", "bank_transfer", "other"]).default("cash"),
  vendor: z.string().max(200).optional().nullable(),
  reference: z.string().max(200).optional().nullable(),
  expense_date: z.string().min(1, "Date is required"),
  notes: z.string().max(1000).optional().nullable(),
  is_recurring: z.boolean().default(false),
  recurring_period: z.enum(["daily", "weekly", "monthly", "yearly"]).optional().nullable(),
});

export type ExpenseInput = z.infer<typeof expenseSchema>;
