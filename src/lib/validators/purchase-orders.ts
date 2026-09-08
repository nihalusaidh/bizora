import { z } from "zod";

export const purchaseOrderItemSchema = z.object({
  product_id: z.string().uuid().optional().nullable(),
  name: z.string().min(1, "Item name is required").max(200),
  sku: z.string().max(50).optional().nullable(),
  ordered_quantity: z.coerce.number().positive("Quantity must be positive"),
  unit: z.string().max(10).default("pc"),
  unit_cost: z.coerce.number().min(0, "Cost must be positive"),
  tax_rate: z.coerce.number().min(0).max(100).default(0),
  tax_amount: z.coerce.number().min(0).default(0),
  total: z.coerce.number(),
});

export type PurchaseOrderItemInput = z.infer<typeof purchaseOrderItemSchema>;

export const purchaseOrderSchema = z.object({
  supplier_id: z.string().uuid("Supplier is required"),
  items: z.array(purchaseOrderItemSchema).min(1, "At least one item is required"),
  discount_amount: z.coerce.number().min(0).default(0),
  expected_date: z.string().optional().nullable(),
  amount_paid: z.coerce.number().min(0).default(0),
  notes: z.string().max(1000).optional().nullable(),
});

export type PurchaseOrderInput = z.infer<typeof purchaseOrderSchema>;
