import { z } from "zod";

export const businessTypeSchema = z.object({
  business_type: z.string().min(1, "Please select a business type"),
});

export const businessNameSchema = z.object({
  business_name: z.string().min(2, "Business name must be at least 2 characters"),
});

export const currencySchema = z.object({
  currency: z.string().min(1, "Please select a currency"),
  currency_symbol: z.string().min(1, "Currency symbol is required"),
});

export const gstSchema = z.object({
  gst_status: z.enum(["registered", "unregistered"]),
  gstin: z.string().optional(),
}).refine((data) => {
  if (data.gst_status === "registered") {
    return data.gstin && data.gstin.length > 0;
  }
  return true;
}, {
  message: "GSTIN is required for registered businesses",
  path: ["gstin"],
});

export const businessSizeSchema = z.object({
  business_size: z.enum(["solo", "small", "medium", "large"]),
});

export type BusinessTypeInput = z.infer<typeof businessTypeSchema>;
export type BusinessNameInput = z.infer<typeof businessNameSchema>;
export type CurrencyInput = z.infer<typeof currencySchema>;
export type GstInput = z.infer<typeof gstSchema>;
export type BusinessSizeInput = z.infer<typeof businessSizeSchema>;
