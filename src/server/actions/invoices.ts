"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { invoiceSchema, type InvoiceInput } from "@/lib/validators/invoices";

export async function getNextInvoiceNumber(businessId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invoices")
    .select("invoice_number")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") throw new Error(error.message);

  if (!data) return "INV-0001";

  const lastNum = parseInt(data.invoice_number.split("-")[1] || "0", 10);
  const nextNum = lastNum + 1;
  return `INV-${String(nextNum).padStart(4, "0")}`;
}

export async function createInvoice(businessId: string, input: InvoiceInput) {
  const parsed = invoiceSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  const supabase = await createClient();
  const admin = createAdminClient();
  const invoiceNumber = await getNextInvoiceNumber(businessId);

  // Calculate totals from items
  let subtotal = 0;
  let totalTax = 0;
  let totalItemDiscount = 0;

  const items = parsed.data.items.map((item) => {
    const base = item.unit_price * item.quantity;
    const discountAmt = base * (item.discount_percent / 100);
    const taxableAmount = base - discountAmt;
    const taxAmt = taxableAmount * (item.tax_rate / 100);
    const total = taxableAmount + taxAmt;

    subtotal += base;
    totalTax += taxAmt;
    totalItemDiscount += discountAmt;

    return { ...item, discount_amount: discountAmt, tax_amount: taxAmt, total };
  });

  // Apply global discount
  let globalDiscount = parsed.data.discount_amount;
  if (parsed.data.discount_percent > 0) {
    globalDiscount = subtotal * (parsed.data.discount_percent / 100);
  }

  const afterDiscount = subtotal - globalDiscount - totalItemDiscount;
  const grandTotal = afterDiscount + totalTax;
  const roundOff = Math.round(grandTotal) - grandTotal;
  const finalTotal = Math.round(grandTotal);

  const status = parsed.data.amount_paid >= finalTotal ? "paid" : parsed.data.amount_paid > 0 ? "partial" : "draft";

  // Create invoice
  const { data: invoice, error: invoiceError } = await admin
    .from("invoices")
    .insert({
      business_id: businessId,
      invoice_number: invoiceNumber,
      customer_id: parsed.data.customer_id || null,
      status,
      subtotal,
      discount_amount: globalDiscount + totalItemDiscount,
      discount_percent: parsed.data.discount_percent,
      tax_amount: totalTax,
      round_off: roundOff,
      total: finalTotal,
      amount_paid: parsed.data.amount_paid,
      payment_method: parsed.data.payment_method,
      delivery_method: parsed.data.delivery_method,
      notes: parsed.data.notes,
      terms: parsed.data.terms,
    })
    .select()
    .single();

  if (invoiceError) throw new Error(invoiceError.message);

  // Insert items
  const invoiceItems = items.map((item) => ({
    invoice_id: invoice.id,
    product_id: item.product_id,
    variant_id: item.variant_id,
    name: item.name,
    sku: item.sku,
    quantity: item.quantity,
    unit: item.unit,
    unit_price: item.unit_price,
    cost_price: item.cost_price,
    discount_percent: item.discount_percent,
    discount_amount: item.discount_amount,
    tax_rate: item.tax_rate,
    tax_amount: item.tax_amount,
    total: item.total,
  }));

  const { error: itemsError } = await admin.from("invoice_items").insert(invoiceItems);
  if (itemsError) throw new Error(itemsError.message);

  // Update product stock
  for (const item of items) {
    if (item.product_id) {
      const { data: product } = await admin
        .from("products")
        .select("stock_quantity")
        .eq("id", item.product_id)
        .single();

      if (product) {
        await admin
          .from("products")
          .update({ stock_quantity: Math.max(0, product.stock_quantity - item.quantity) })
          .eq("id", item.product_id);
      }
    }

    if (item.variant_id) {
      const { data: variant } = await admin
        .from("product_variants")
        .select("stock_quantity")
        .eq("id", item.variant_id)
        .single();

      if (variant) {
        await admin
          .from("product_variants")
          .update({ stock_quantity: Math.max(0, variant.stock_quantity - item.quantity) })
          .eq("id", item.variant_id);
      }
    }
  }

  // Update customer stats if customer exists
  if (parsed.data.customer_id) {
    const { data: customer } = await admin
      .from("customers")
      .select("total_spend, purchase_count, outstanding_balance")
      .eq("id", parsed.data.customer_id)
      .single();

    if (customer) {
      await admin
        .from("customers")
        .update({
          total_spend: (customer.total_spend || 0) + finalTotal,
          purchase_count: (customer.purchase_count || 0) + 1,
          last_purchase_at: new Date().toISOString(),
          outstanding_balance: status === "paid"
            ? customer.outstanding_balance
            : (customer.outstanding_balance || 0) + (finalTotal - parsed.data.amount_paid),
        })
        .eq("id", parsed.data.customer_id);
    }
  }

  return invoice;
}

export async function getInvoices(businessId: string, status?: string) {
  const supabase = await createClient();
  let query = supabase
    .from("invoices")
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

export async function getInvoice(businessId: string, invoiceId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invoices")
    .select("*, customers(name, phone, email, address, gst_number), invoice_items(*)")
    .eq("business_id", businessId)
    .eq("id", invoiceId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateInvoiceStatus(
  businessId: string,
  invoiceId: string,
  status: string,
  amountPaid?: number
) {
  const admin = createAdminClient();
  const update: Record<string, unknown> = { status };
  if (amountPaid !== undefined) update.amount_paid = amountPaid;

  const { data, error } = await admin
    .from("invoices")
    .update(update)
    .eq("business_id", businessId)
    .eq("id", invoiceId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteInvoice(businessId: string, invoiceId: string) {
  const admin = createAdminClient();
  const { error } = await admin
    .from("invoices")
    .delete()
    .eq("business_id", businessId)
    .eq("id", invoiceId);

  if (error) throw new Error(error.message);
}
