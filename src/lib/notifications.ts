import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function sendPushNotification(businessId: string, title: string, body: string, data?: Record<string, unknown>) {
  // Get all push subscriptions for this business
  const { data: subscriptions } = await supabase
    .from("push_subscriptions")
    .select("*")
    .eq("business_id", businessId);

  if (!subscriptions?.length) return;

  // In production, use web-push library to send to each endpoint
  // For now, log the notification
  console.log(`[Push] ${title}: ${body} (${subscriptions.length} recipients)`);
  
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
