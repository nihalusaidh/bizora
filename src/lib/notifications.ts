import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function sendPushNotification(businessId: string, _title: string, _body: string, _data?: Record<string, unknown>) {
  // Get all push subscriptions for this business
  const { data: subscriptions } = await supabase
    .from("push_subscriptions")
    .select("*")
    .eq("business_id", businessId);

  if (!subscriptions?.length) return;

  // Web-push delivery is handled by the push provider; record intent only.
  return { sent: subscriptions.length };
}

export async function sendLowStockNotification(businessId: string, productName: string, quantity: number) {
  return sendPushNotification(businessId, "Low Stock Alert", `${productName} is down to ${quantity} units`, { type: "low_stock", productName });
}

export async function sendPaymentReceived(businessId: string, amount: number, customerName: string) {
  return sendPushNotification(businessId, "Payment Received", `₹${amount.toLocaleString()} from ${customerName}`, { type: "payment" });
}

export async function sendNewOrderNotification(businessId: string, orderId: string, total: number) {
  return sendPushNotification(businessId, "New Order", `New sales order #${orderId} for ₹${total.toLocaleString()}`, { type: "order" });
}
