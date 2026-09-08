"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { purchaseOrderSchema, type PurchaseOrderInput } from "@/lib/validators/purchase-orders";

export async function getNextPoNumber(businessId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("purchase_orders")
    .select("po_number")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") throw new Error(error.message);
  if (!data) return "PO-0001";

  const lastNum = parseInt(data.po_number.split("-")[1] || "0", 10);
  return `PO-${String(lastNum + 1).padStart(4, "0")}`;
}

export async function createPurchaseOrder(businessId: string, input: PurchaseOrderInput) {
  const parsed = purchaseOrderSchema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  const supabase = await createClient();
  const admin = createAdminClient();
  const poNumber = await getNextPoNumber(businessId);

  let subtotal = 0;
  let totalTax = 0;

  const items = parsed.data.items.map((item) => {
    const base = item.unit_cost * item.ordered_quantity;
    const taxAmt = base * (item.tax_rate / 100);
    const total = base + taxAmt;
    subtotal += base;
    totalTax += taxAmt;
    return { ...item, tax_amount: taxAmt, total };
  });

  const total = subtotal + totalTax - parsed.data.discount_amount;

  const { data: po, error: poError } = await admin
    .from("purchase_orders")
    .insert({
      business_id: businessId,
      supplier_id: parsed.data.supplier_id,
      po_number: poNumber,
      status: "draft",
      subtotal,
      tax_amount: totalTax,
      discount_amount: parsed.data.discount_amount,
      total,
      amount_paid: parsed.data.amount_paid,
      expected_date: parsed.data.expected_date || null,
      notes: parsed.data.notes || null,
    })
    .select()
    .single();

  if (poError) throw new Error(poError.message);

  const poItems = items.map((item) => ({
    purchase_order_id: po.id,
    product_id: item.product_id || null,
    name: item.name,
    sku: item.sku,
    ordered_quantity: item.ordered_quantity,
    received_quantity: 0,
    unit: item.unit,
    unit_cost: item.unit_cost,
    tax_rate: item.tax_rate,
    tax_amount: item.tax_amount,
    total: item.total,
  }));

  const { error: itemsError } = await admin.from("purchase_order_items").insert(poItems);
  if (itemsError) throw new Error(itemsError.message);

  return po;
}

export async function getPurchaseOrders(businessId: string, status?: string) {
  const supabase = await createClient();
  let query = supabase
    .from("purchase_orders")
    .select("*, suppliers(name, phone)")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function getPurchaseOrder(businessId: string, poId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("purchase_orders")
    .select("*, suppliers(id, name, phone, email, address, gst_number), purchase_order_items(*)")
    .eq("business_id", businessId)
    .eq("id", poId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function receivePurchaseOrderItems(
  businessId: string,
  poId: string,
  items: Array<{ id: string; received_quantity: number }>
) {
  const supabase = await createClient();
  const admin = createAdminClient();

  for (const item of items) {
    const { error } = await admin
      .from("purchase_order_items")
      .update({ received_quantity: item.received_quantity })
      .eq("id", item.id);

    if (error) throw new Error(error.message);
  }

  // Check if all items fully received
  const { data: poItems } = await supabase
    .from("purchase_order_items")
    .select("ordered_quantity, received_quantity")
    .eq("purchase_order_id", poId);

  if (poItems) {
    const allReceived = poItems.every(
      (i) => Number(i.received_quantity) >= Number(i.ordered_quantity)
    );
    const anyReceived = poItems.some(
      (i) => Number(i.received_quantity) > 0
    );

    let newStatus = "ordered";
    if (allReceived) newStatus = "received";
    else if (anyReceived) newStatus = "partial";

    const { error: statusError } = await admin
      .from("purchase_orders")
      .update({
        status: newStatus,
        received_date: allReceived ? new Date().toISOString().split("T")[0] : null,
      })
      .eq("id", poId);

    if (statusError) throw new Error(statusError.message);

    // If fully received, update product stock
    if (allReceived) {
      const { data: fullItems } = await supabase
        .from("purchase_order_items")
        .select("product_id, received_quantity")
        .eq("purchase_order_id", poId)
        .not("product_id", "is", null);

      if (fullItems) {
        for (const item of fullItems) {
          const { data: product } = await supabase
            .from("products")
            .select("stock_quantity")
            .eq("id", item.product_id)
            .single();

          if (product) {
            await admin
              .from("products")
              .update({ stock_quantity: product.stock_quantity + Number(item.received_quantity) })
              .eq("id", item.product_id);
          }
        }
      }
    }
  }

  return { success: true };
}

export async function updatePurchaseOrderStatus(
  businessId: string,
  poId: string,
  status: string,
  amountPaid?: number
) {
  const admin = createAdminClient();
  const update: Record<string, unknown> = { status };
  if (amountPaid !== undefined) update.amount_paid = amountPaid;

  const { data, error } = await admin
    .from("purchase_orders")
    .update(update)
    .eq("business_id", businessId)
    .eq("id", poId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deletePurchaseOrder(businessId: string, poId: string) {
  const admin = createAdminClient();
  const { error } = await admin
    .from("purchase_orders")
    .delete()
    .eq("business_id", businessId)
    .eq("id", poId);

  if (error) throw new Error(error.message);
}
