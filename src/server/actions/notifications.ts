"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  entity_type?: string | null;
  entity_id?: string | null;
  is_read: boolean;
  is_dismissed: boolean;
  created_at: string;
}

export async function getNotifications(businessId: string, userId?: string) {
  const supabase = await createClient();
  let query = supabase
    .from("notifications")
    .select("*")
    .eq("business_id", businessId)
    .eq("is_dismissed", false)
    .order("created_at", { ascending: false })
    .limit(50);

  if (userId) {
    query = query.or(`user_id.is.null,user_id.eq.${userId}`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data as Notification[];
}

export async function getUnreadCount(businessId: string, userId?: string) {
  const supabase = await createClient();
  let query = supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("business_id", businessId)
    .eq("is_read", false)
    .eq("is_dismissed", false);

  if (userId) {
    query = query.or(`user_id.is.null,user_id.eq.${userId}`);
  }

  const { count, error } = await query;
  if (error) throw new Error(error.message);
  return count || 0;
}

export async function markAsRead(businessId: string, notificationId: string) {
  const admin = createAdminClient();
  const { error } = await admin
    .from("notifications")
    .update({ is_read: true })
    .eq("business_id", businessId)
    .eq("id", notificationId);

  if (error) throw new Error(error.message);
}

export async function markAllAsRead(businessId: string, userId?: string) {
  const admin = createAdminClient();
  const update = { is_read: true };

  let query = admin
    .from("notifications")
    .update(update)
    .eq("business_id", businessId)
    .eq("is_read", false);

  if (userId) {
    query = query.or(`user_id.is.null,user_id.eq.${userId}`);
  }

  const { error } = await query;
  if (error) throw new Error(error.message);
}

export async function dismissNotification(businessId: string, notificationId: string) {
  const admin = createAdminClient();
  const { error } = await admin
    .from("notifications")
    .update({ is_dismissed: true })
    .eq("business_id", businessId)
    .eq("id", notificationId);

  if (error) throw new Error(error.message);
}

export async function createNotification(
  businessId: string,
  notification: {
    type: string;
    title: string;
    message: string;
    entity_type?: string;
    entity_id?: string;
    user_id?: string;
  }
) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("notifications")
    .insert({
      business_id: businessId,
      ...notification,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function generateAlerts(businessId: string) {
  const admin = createAdminClient();
  const alerts: Array<{ type: string; title: string; message: string; entity_type: string; entity_id: string }> = [];

  // Low stock alerts
  const { data: lowStockProducts } = await admin
    .from("products")
    .select("id, name, stock_quantity, min_stock")
    .eq("business_id", businessId)
    .eq("is_active", true)
    .lte("stock_quantity", 5);

  if (lowStockProducts) {
    const { data: prods } = await admin
      .from("products")
      .select("id, name, stock_quantity, min_stock")
      .eq("business_id", businessId)
      .eq("is_active", true);

    if (prods) {
      for (const product of prods) {
        if (product.stock_quantity <= (product.min_stock || 5) && product.stock_quantity > 0) {
          alerts.push({
            type: "low_stock",
            title: "Low Stock Warning",
            message: `${product.name} has only ${product.stock_quantity} units left`,
            entity_type: "product",
            entity_id: product.id,
          });
        } else if (product.stock_quantity === 0) {
          alerts.push({
            type: "low_stock",
            title: "Out of Stock",
            message: `${product.name} is out of stock`,
            entity_type: "product",
            entity_id: product.id,
          });
        }
      }
    }
  }

  // Payment due alerts (partial invoices)
  const { data: pendingInvoices } = await admin
    .from("invoices")
    .select("id, invoice_number, total, amount_paid, customers(name)")
    .eq("business_id", businessId)
    .eq("status", "partial");

  if (pendingInvoices) {
    for (const inv of pendingInvoices) {
      const balance = Number(inv.total) - Number(inv.amount_paid);
      const custName = (inv.customers as unknown as { name?: string } | null)?.name || "Customer";
      alerts.push({
        type: "payment_due",
        title: "Payment Pending",
        message: `${custName} owes ₹${balance.toLocaleString()} for ${inv.invoice_number}`,
        entity_type: "invoice",
        entity_id: inv.id,
      });
    }
  }

  // Customer outstanding balance alerts
  const { data: customersWithDues } = await admin
    .from("customers")
    .select("id, name, outstanding_balance")
    .eq("business_id", businessId)
    .eq("is_active", true)
    .gt("outstanding_balance", 0);

  if (customersWithDues) {
    for (const customer of customersWithDues) {
      alerts.push({
        type: "payment_due",
        title: "Customer Dues",
        message: `${customer.name} has outstanding balance of ₹${Number(customer.outstanding_balance).toLocaleString()}`,
        entity_type: "customer",
        entity_id: customer.id,
      });
    }
  }

  // Create notifications for new alerts
  const { data: existingNotifs } = await admin
    .from("notifications")
    .select("entity_type, entity_id, type")
    .eq("business_id", businessId)
    .eq("is_dismissed", false);

  const existingSet = new Set(
    (existingNotifs || []).map((n) => `${n.type}:${n.entity_type}:${n.entity_id}`)
  );

  let created = 0;
  for (const alert of alerts) {
    const key = `${alert.type}:${alert.entity_type}:${alert.entity_id}`;
    if (!existingSet.has(key)) {
      await createNotification(businessId, alert);
      created++;
    }
  }

  return { alerts: alerts.length, created };
}
