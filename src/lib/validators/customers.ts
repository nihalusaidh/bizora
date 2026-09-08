import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().min(1, "Customer name is required").max(200),
  phone: z.string().max(20).optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal("")),
  address: z.string().max(500).optional().nullable(),
  gst_number: z.string().max(20).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  preferred_delivery: z.enum(["whatsapp", "print", "both", "ask"]).default("ask"),
  is_active: z.boolean().default(true),
});

export type CustomerInput = z.infer<typeof customerSchema>;

export const customerPaymentSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive"),
  payment_method: z.enum(["cash", "upi", "card", "bank_transfer", "other"]).default("cash"),
  reference: z.string().max(200).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

export type CustomerPaymentInput = z.infer<typeof customerPaymentSchema>;

export const customerCreditSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive"),
  description: z.string().max(500).optional().nullable(),
  due_date: z.string().optional().nullable(),
});

export type CustomerCreditInput = z.infer<typeof customerCreditSchema>;
