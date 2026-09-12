import { createClient } from "@/lib/supabase/client";

export async function getEstimates(businessId: string, status?: string) {
  const supabase = createClient();
  let query = supabase
    .from("estimates")
    .select("*, customers(name, phone)")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function getEstimate(businessId: string, estimateId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("estimates")
    .select("*, customers(name, phone, email, address, gst_number), estimate_items(*)")
    .eq("business_id", businessId)
    .eq("id", estimateId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getNextEstimateNumber(businessId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("estimates")
    .select("estimate_number")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") throw new Error(error.message);
  if (!data) return "EST-0001";

  const lastNum = parseInt(data.estimate_number.split("-")[1] || "0", 10);
  return `EST-${String(lastNum + 1).padStart(4, "0")}`;
}

export async function createEstimate(businessId: string, input: {
  customer_id?: string | null;
  items: Array<{
    product_id?: string | null;
    variant_id?: string | null;
    name: string;
    sku?: string | null;
    quantity: number;
    unit?: string;
    unit_price: number;
    discount_percent?: number;
    tax_rate?: number;
  }>;
  discount_percent?: number;
  notes?: string | null;
  valid_until?: string | null;
}) {
  const supabase = createClient();
  const estimateNumber = await getNextEstimateNumber(businessId);

  let subtotal = 0;
  let totalTax = 0;
  let totalItemDiscount = 0;

  const items = input.items.map((item) => {
    const base = item.unit_price * item.quantity;
    const discountAmt = base * ((item.discount_percent || 0) / 100);
    const taxableAmount = base - discountAmt;
    const taxAmt = taxableAmount * ((item.tax_rate || 0) / 100);
    const total = taxableAmount + taxAmt;

    subtotal += base;
    totalTax += taxAmt;
    totalItemDiscount += discountAmt;

    return { ...item, discount_amount: discountAmt, tax_amount: taxAmt, total, unit: item.unit || "pcs" };
  });

  let globalDiscount = 0;
  if (input.discount_percent && input.discount_percent > 0) {
    globalDiscount = subtotal * (input.discount_percent / 100);
  }

  const grandTotal = subtotal - globalDiscount - totalItemDiscount + totalTax;

  const { data: estimate, error: estError } = await supabase
    .from("estimates")
    .insert({
      business_id: businessId,
      estimate_number: estimateNumber,
      customer_id: input.customer_id || null,
      status: "draft",
      subtotal,
      discount_amount: globalDiscount + totalItemDiscount,
      discount_percent: input.discount_percent || 0,
      tax_amount: totalTax,
      total: Math.round(grandTotal),
      valid_until: input.valid_until || null,
      notes: input.notes,
    })
    .select()
    .single();

  if (estError) throw new Error(estError.message);

  const estimateItems = items.map((item) => ({
    estimate_id: estimate.id,
    product_id: item.product_id,
    variant_id: item.variant_id,
    name: item.name,
    sku: item.sku,
    quantity: item.quantity,
    unit: item.unit,
    unit_price: item.unit_price,
    discount_percent: item.discount_percent || 0,
    discount_amount: item.discount_amount,
    tax_rate: item.tax_rate || 0,
    tax_amount: item.tax_amount,
    total: item.total,
  }));

  const { error: itemsError } = await supabase.from("estimate_items").insert(estimateItems);
  if (itemsError) throw new Error(itemsError.message);

  return estimate;
}

export async function updateEstimateStatus(businessId: string, estimateId: string, status: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("estimates")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("business_id", businessId)
    .eq("id", estimateId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteEstimate(businessId: string, estimateId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("estimates")
    .delete()
    .eq("business_id", businessId)
    .eq("id", estimateId);

  if (error) throw new Error(error.message);
}

export async function convertEstimateToInvoice(businessId: string, estimateId: string) {
  const supabase = createClient();

  const { data: estimate, error: estError } = await supabase
    .from("estimates")
    .select("*, estimate_items(*)")
    .eq("business_id", businessId)
    .eq("id", estimateId)
    .single();

  if (estError) throw new Error(estError.message);
  if (estimate.status === "converted") throw new Error("Estimate already converted");

  const { data: invoices } = await supabase
    .from("invoices")
    .select("invoice_number")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
    .limit(1);

  let invoiceNumber = "INV-0001";
  if (invoices && invoices.length > 0) {
    const lastNum = parseInt(invoices[0].invoice_number.split("-")[1] || "0", 10);
    invoiceNumber = `INV-${String(lastNum + 1).padStart(4, "0")}`;
  }

  const { data: invoice, error: invError } = await supabase
    .from("invoices")
    .insert({
      business_id: businessId,
      invoice_number: invoiceNumber,
      customer_id: estimate.customer_id,
      estimate_id: estimateId,
      status: "draft",
      subtotal: estimate.subtotal,
      discount_amount: estimate.discount_amount,
      discount_percent: estimate.discount_percent,
      tax_amount: estimate.tax_amount,
      round_off: 0,
      total: estimate.total,
      amount_paid: 0,
    })
    .select()
    .single();

  if (invError) throw new Error(invError.message);

  const invoiceItems = estimate.estimate_items.map((item: Record<string, unknown>) => ({
    invoice_id: invoice.id,
    product_id: item.product_id,
    variant_id: item.variant_id,
    name: item.name,
    sku: item.sku,
    quantity: item.quantity,
    unit: item.unit,
    unit_price: item.unit_price,
    cost_price: null,
    discount_percent: item.discount_percent,
    discount_amount: item.discount_amount,
    tax_rate: item.tax_rate,
    tax_amount: item.tax_amount,
    total: item.total,
  }));

  const { error: itemsError } = await supabase.from("invoice_items").insert(invoiceItems);
  if (itemsError) throw new Error(itemsError.message);

  await supabase
    .from("estimates")
    .update({ status: "converted", updated_at: new Date().toISOString() })
    .eq("id", estimateId);

  return invoice;
}
