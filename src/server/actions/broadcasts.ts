import { createClient } from "@/lib/supabase/client";
import type { BroadcastTemplateType, BroadcastChannel } from "@/types/database";

const TEMPLATES: Record<BroadcastTemplateType, (data: { businessName: string; productName?: string; offerText?: string }) => { title: string; message: string }> = {
  new_stock: ({ businessName, productName }) => ({
    title: `New Stock: ${productName || "New Products"}`,
    message: `🎉 New stock just arrived at ${businessName}!\n\n${productName ? `📦 ${productName} is now available.` : "Check out our latest arrivals!"}\n\nVisit us today or order on WhatsApp.`,
  }),
  offer: ({ businessName, productName, offerText }) => ({
    title: `Special Offer${productName ? `: ${productName}` : ""}`,
    message: `🔥 Special Offer at ${businessName}!\n\n${offerText || "Get amazing discounts on selected products!"}\n\n${productName ? `📦 ${productName}\n\n` : ""}Hurry, limited time only!`,
  }),
  restock: ({ businessName, productName }) => ({
    title: `Restocked: ${productName || "Products"}`,
    message: `✅ Back in stock at ${businessName}!\n\n${productName ? `${productName} is available again.` : "Your favourite products are back!"}\n\nGrab them before they run out!`,
  }),
  back_in_stock: ({ businessName, productName }) => ({
    title: `Back in Stock: ${productName || "Products"}`,
    message: `📢 Good news from ${businessName}!\n\n${productName ? `${productName} is back in stock!` : "Products you were looking for are back!"}\n\nOrder now.`,
  }),
  custom: ({ businessName }) => ({
    title: `Message from ${businessName}`,
    message: `Hello from ${businessName}!\n\n`,
  }),
};

export function getTemplatePreview(type: BroadcastTemplateType, data: { businessName: string; productName?: string; offerText?: string }) {
  const template = TEMPLATES[type](data);
  return template;
}

export async function getCustomersWithPhone(businessId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("customers")
    .select("id, name, phone")
    .eq("business_id", businessId)
    .eq("is_active", true)
    .not("phone", "is", null)
    .order("name");

  if (error) throw new Error(error.message);
  return (data || []).filter((c) => c.phone && c.phone.length >= 10);
}

export async function createBroadcast(businessId: string, input: {
  title: string;
  message: string;
  template_type: BroadcastTemplateType;
  product_id?: string | null;
  channel: BroadcastChannel;
  customer_ids: string[];
}) {
  const supabase = createClient();

  const { data: customers } = await supabase
    .from("customers")
    .select("id, phone")
    .in("id", input.customer_ids);

  const recipients = (customers || []).filter((c) => c.phone && c.phone.length >= 10);

  const { data: broadcast, error: bError } = await supabase
    .from("customer_broadcasts")
    .insert({
      business_id: businessId,
      title: input.title,
      message: input.message,
      template_type: input.template_type,
      product_id: input.product_id || null,
      channel: input.channel,
      recipient_count: recipients.length,
      sent_count: 0,
      failed_count: 0,
      status: "draft",
    })
    .select()
    .single();

  if (bError) throw new Error(bError.message);

  const recipientRows = recipients.map((c) => ({
    broadcast_id: broadcast.id,
    customer_id: c.id,
    phone: c.phone,
    channel: input.channel === "both" ? "whatsapp" : input.channel,
    status: "pending",
  }));

  const { error: rError } = await supabase.from("customer_broadcast_recipients").insert(recipientRows);
  if (rError) throw new Error(rError.message);

  return broadcast;
}

export async function sendBroadcastWhatsApp(businessId: string, broadcastId: string) {
  const supabase = createClient();

  const { data: broadcast, error: bError } = await supabase
    .from("customer_broadcasts")
    .select("*, customer_broadcast_recipients(*)")
    .eq("business_id", businessId)
    .eq("id", broadcastId)
    .single();

  if (bError) throw new Error(bError.message);

  await supabase
    .from("customer_broadcasts")
    .update({ status: "sending" })
    .eq("id", broadcastId);

  const recipients = broadcast.customer_broadcast_recipients || [];
  let sentCount = 0;
  let failedCount = 0;

  for (const recipient of recipients) {
    if (!recipient.phone || recipient.status === "sent") continue;

    try {
      const phone = recipient.phone.replace(/[^0-9]/g, "");
      const url = `https://wa.me/${phone}?text=${encodeURIComponent(broadcast.message)}`;
      window.open(url, "_blank");

      await supabase
        .from("customer_broadcast_recipients")
        .update({ status: "sent", sent_at: new Date().toISOString() })
        .eq("id", recipient.id);

      sentCount++;
    } catch {
      failedCount++;
      await supabase
        .from("customer_broadcast_recipients")
        .update({ status: "failed", error_message: "Failed to open WhatsApp" })
        .eq("id", recipient.id);
    }
  }

  await supabase
    .from("customer_broadcasts")
    .update({
      status: sentCount === recipients.length ? "sent" : sentCount > 0 ? "partial" : "failed",
      sent_count: sentCount,
      failed_count: failedCount,
      sent_at: new Date().toISOString(),
    })
    .eq("id", broadcastId);

  return { sentCount, failedCount, total: recipients.length };
}

export async function getBroadcasts(businessId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("customer_broadcasts")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteBroadcast(businessId: string, broadcastId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("customer_broadcasts")
    .delete()
    .eq("business_id", businessId)
    .eq("id", broadcastId);

  if (error) throw new Error(error.message);
}
