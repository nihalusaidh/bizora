import { z } from "zod";

export const invoiceItemSchema = z.object({
  product_id: z.string().uuid().optional().nullable(),
  variant_id: z.string().uuid().optional().nullable(),
  name: z.string().min(1, "Item name is required").max(200),
  sku: z.string().max(50).optional().nullable(),
  quantity: z.coerce.number().positive("Quantity must be positive"),
  unit: z.string().max(10).default("pc"),
  unit_price: z.coerce.number().min(0, "Price must be positive"),
  cost_price: z.coerce.number().min(0).optional().nullable(),
  discount_percent: z.coerce.number().min(0).max(100).default(0),
  discount_amount: z.coerce.number().min(0).default(0),
  tax_rate: z.coerce.number().min(0).max(100).default(0),
  tax_amount: z.coerce.number().min(0).default(0),
  total: z.coerce.number(),
});

export type InvoiceItemInput = z.infer<typeof invoiceItemSchema>;

export const invoiceSchema = z.object({
  customer_id: z.string().uuid().optional().nullable(),
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
  discount_amount: z.coerce.number().min(0).default(0),
  discount_percent: z.coerce.number().min(0).max(100).default(0),
  delivery_method: z.enum(["whatsapp", "print", "both", "ask"]).default("ask"),
  payment_method: z.enum(["cash", "upi", "card", "bank_transfer", "credit", "other"]).optional().nullable(),
  amount_paid: z.coerce.number().min(0).default(0),
  notes: z.string().max(1000).optional().nullable(),
  terms: z.string().max(1000).optional().nullable(),
});

export type InvoiceInput = z.infer<typeof invoiceSchema>;
