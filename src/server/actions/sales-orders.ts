import { createClient } from "@/lib/supabase/client";

export async function getSalesOrders(businessId: string, status?: string) {
  const supabase = createClient();
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
  const supabase = createClient();
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
  const supabase = createClient();
  const { data, error } = await supabase
    .from("sales_orders")
    .select("order_number")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();
  if (error && error.code !== "PGRST116") throw new Error(error.message);
  if (!data) return "SO-0001";
  const lastNum = parseInt(data.order_number.split("-")[1] || "0", 10);
  return `SO-${String(lastNum + 1).padStart(4, "0")}`;
}

export async function createSalesOrder(businessId: string, input: {
  customer_id?: string | null;
  items: Array<{ product_id?: string | null; name: string; sku?: string | null; quantity: number; unit_price: number; discount_percent?: number; tax_rate?: number }>;
  discount_amount?: number;
  expected_date?: string | null;
  notes?: string | null;
}) {
  const supabase = createClient();
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
  const supabase = createClient();
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
  const supabase = createClient();
  const { error } = await supabase.from("sales_orders").delete().eq("business_id", businessId).eq("id", orderId);
  if (error) throw new Error(error.message);
}

export async function convertOrderToInvoice(businessId: string, orderId: string) {
  const supabase = createClient();
  const { data: order, error } = await supabase
    .from("sales_orders")
    .select("*, sales_order_items(*)")
    .eq("business_id", businessId)
    .eq("id", orderId)
    .single();
  if (error) throw new Error(error.message);

  const { data: invoices } = await supabase
    .from("invoices").select("invoice_number").eq("business_id", businessId)
    .order("created_at", { ascending: false }).limit(1);

  let invoiceNumber = "INV-0001";
  if (invoices && invoices.length > 0) {
    const lastNum = parseInt(invoices[0].invoice_number.split("-")[1] || "0", 10);
    invoiceNumber = `INV-${String(lastNum + 1).padStart(4, "0")}`;
  }

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

  const items = order.sales_order_items.map((item: Record<string, unknown>) => ({
    invoice_id: invoice.id, product_id: item.product_id, name: item.name, sku: item.sku,
    quantity: item.quantity, unit: "pcs", unit_price: item.unit_price, cost_price: null,
    discount_percent: item.discount_percent || 0, discount_amount: 0, tax_rate: item.tax_rate || 0,
    tax_amount: 0, total: item.total,
  }));

  await supabase.from("invoice_items").insert(items);
  await supabase.from("sales_orders").update({ status: "dispatched", updated_at: new Date().toISOString() }).eq("id", orderId);
  return invoice;
}
