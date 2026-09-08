import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(100),
  parent_id: z.string().uuid().optional().nullable(),
  icon: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  sort_order: z.number().int().min(0).default(0),
});

export type CategoryInput = z.infer<typeof categorySchema>;

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required").max(200),
  sku: z.string().max(50).optional().nullable(),
  barcode: z.string().max(50).optional().nullable(),
  category_id: z.string().uuid().optional().nullable(),
  brand: z.string().max(100).optional().nullable(),
  cost_price: z.coerce.number().min(0, "Cost price must be positive"),
  selling_price: z.coerce.number().min(0, "Selling price must be positive"),
  gst_rate: z.coerce.number().min(0).max(100).default(0),
  hsn_sac: z.string().max(20).optional().nullable(),
  min_stock: z.coerce.number().int().min(0).default(0),
  supplier_id: z.string().uuid().optional().nullable(),
  image_url: z.string().url().optional().nullable(),
  has_variants: z.boolean().default(false),
  is_active: z.boolean().default(true),
});

export type ProductInput = z.infer<typeof productSchema>;

export const productVariantSchema = z.object({
  name: z.string().min(1, "Variant name is required").max(100),
  sku: z.string().max(50).optional().nullable(),
  barcode: z.string().max(50).optional().nullable(),
  cost_price: z.coerce.number().min(0).optional().nullable(),
  selling_price: z.coerce.number().min(0).optional().nullable(),
  attributes: z.record(z.string(), z.string()).default({}),
  stock_quantity: z.coerce.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
});

export type ProductVariantInput = z.infer<typeof productVariantSchema>;

export const supplierSchema = z.object({
  name: z.string().min(1, "Supplier name is required").max(200),
  phone: z.string().max(20).optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal("")),
  address: z.string().max(500).optional().nullable(),
  gst_number: z.string().max(20).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  is_active: z.boolean().default(true),
});

export type SupplierInput = z.infer<typeof supplierSchema>;
