import { requireBusiness } from "@/lib/auth";

export async function getSalesOrders(businessId: string, status?: string) {
  const auth = await requireBusiness();
  if (auth.error || !auth.supabase || !auth.businessId) return { error: auth.error };
  const supabase = auth.supabase;

  let query = supabase
    .from("sales_orders")
    .select("*, customers(name, phone)")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });
  if (status && status !== "all") query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function getSalesOrder(businessId: string, orderId: string) {
  const auth = await requireBusiness();
  if (auth.error || !auth.supabase || !auth.businessId) return { error: auth.error };
  const supabase = auth.supabase;

  const { data, error } = await supabase
    .from("sales_orders")
    .select("*, customers(name, phone, email, address), sales_order_items(*)")
    .eq("business_id", businessId)
    .eq("id", orderId)
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function getNextOrderNumber(businessId: string) {
  const auth = await requireBusiness();
  if (auth.error || !auth.supabase || !auth.businessId) return { error: auth.error };
  const suffix = crypto.randomUUID().replace(/-/g, "").substring(0, 8).toUpperCase();
  return `SO-${suffix}`;
}

export async function createSalesOrder(businessId: string, input: {
  customer_id?: string | null;
  items: Array<{ product_id?: string | null; name: string; sku?: string | null; quantity: number; unit_price: number; discount_percent?: number; tax_rate?: number }>;
  discount_amount?: number;
  expected_date?: string | null;
  notes?: string | null;
}) {
  const auth = await requireBusiness();
  if (auth.error || !auth.supabase || !auth.businessId) return { error: auth.error };
  const supabase = auth.supabase;

  const orderNumber = await getNextOrderNumber(businessId);

  let subtotal = 0;
  let totalTax = 0;
  const items = input.items.map((item) => {
    const base = item.unit_price * item.quantity;
    const discountAmt = base * ((item.discount_percent || 0) / 100);
    const taxable = base - discountAmt;
    const tax = taxable * ((item.tax_rate || 0) / 100);
    subtotal += base;
    totalTax += tax;
    return { ...item, discount_percent: item.discount_percent || 0, tax_rate: item.tax_rate || 0, total: taxable + tax, unit: "pcs" };
  });

  const total = subtotal - (input.discount_amount || 0) + totalTax;

  const { data: order, error: oError } = await supabase
    .from("sales_orders")
    .insert({
      business_id: businessId,
      order_number: orderNumber,
      customer_id: input.customer_id || null,
      status: "pending",
      subtotal,
      tax_amount: totalTax,
      discount_amount: input.discount_amount || 0,
      total: Math.round(total),
      expected_date: input.expected_date || null,
      notes: input.notes,
    })
    .select()
    .single();

  if (oError) throw new Error(oError.message);

  const orderItems = items.map((item) => ({
    sales_order_id: order.id,
    product_id: item.product_id,
    name: item.name,
    sku: item.sku,
    quantity: item.quantity,
    unit: "pcs",
    unit_price: item.unit_price,
    discount_percent: item.discount_percent,
    tax_rate: item.tax_rate,
    total: item.total,
  }));

  const { error: iError } = await supabase.from("sales_order_items").insert(orderItems);
  if (iError) throw new Error(iError.message);

  return order;
}

export async function updateSalesOrderStatus(businessId: string, orderId: string, status: string) {
  const auth = await requireBusiness();
  if (auth.error || !auth.supabase || !auth.businessId) return { error: auth.error };
  const supabase = auth.supabase;

  const { data, error } = await supabase
    .from("sales_orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("business_id", businessId)
    .eq("id", orderId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteSalesOrder(businessId: string, orderId: string) {
  const auth = await requireBusiness();
  if (auth.error || !auth.supabase || !auth.businessId) return { error: auth.error };
  const supabase = auth.supabase;

  const { error } = await supabase.from("sales_orders").delete().eq("business_id", businessId).eq("id", orderId);
  if (error) throw new Error(error.message);
}

export async function convertOrderToInvoice(businessId: string, orderId: string) {
  const auth = await requireBusiness();
  if (auth.error || !auth.supabase || !auth.businessId) return { error: auth.error };
  const supabase = auth.supabase;

  const { data: order, error } = await supabase
    .from("sales_orders")
    .select("*, sales_order_items(*)")
    .eq("business_id", businessId)
    .eq("id", orderId)
    .single();
  if (error) throw new Error(error.message);

  const invoiceNumber = `INV-${crypto.randomUUID().replace(/-/g, "").substring(0, 8).toUpperCase()}`;

  const { data: invoice, error: iErr } = await supabase
    .from("invoices")
    .insert({
      business_id: businessId, invoice_number: invoiceNumber, customer_id: order.customer_id,
      status: "draft", subtotal: order.subtotal, discount_amount: order.discount_amount,
      tax_amount: order.tax_amount, round_off: 0, total: order.total, amount_paid: 0,
    })
    .select()
    .single();

  if (iErr) throw new Error(iErr.message);

  const items = order.sales_order_items.map((item: Record<string, unknown>) => {
    const unitPrice = Number(item.unit_price) || 0;
    const qty = Number(item.quantity) || 0;
    const discountPct = Number(item.discount_percent) || 0;
    const taxRate = Number(item.tax_rate) || 0;
    const base = unitPrice * qty;
    const discountAmt = base * (discountPct / 100);
    const taxable = base - discountAmt;
    const taxAmt = taxable * (taxRate / 100);
    return {
      invoice_id: invoice.id, product_id: item.product_id, name: item.name, sku: item.sku,
      quantity: item.quantity, unit: "pcs", unit_price: unitPrice, cost_price: null,
      discount_percent: discountPct, discount_amount: discountAmt, tax_rate: taxRate,
      tax_amount: taxAmt, total: taxable + taxAmt,
    };
  });

  await supabase.from("invoice_items").insert(items);
  await supabase.from("sales_orders").update({ status: "dispatched", updated_at: new Date().toISOString() }).eq("id", orderId);
  return invoice;
}
