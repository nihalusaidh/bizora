import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyPaymentSignature } from "@/lib/payments/razorpay";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // Verify webhook signature
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "";
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);

    switch (event.event) {
      case "subscription.activated":
      case "subscription.activated": {
        const subscription = event.payload.subscription.entity;
        const businessId = subscription.notes?.business_id;

        if (businessId) {
          const planId = subscription.plan_id;
          let planTier = "gold";

          // Determine plan from amount
          if (subscription.plan_id) {
            const amount = Number(subscription.plan_amount || 0);
            if (amount >= 69900) planTier = "diamond";
            else if (amount >= 39900) planTier = "gold";
          }

          await supabase
            .from("businesses")
            .update({
              plan: planTier,
              razorpay_subscription_id: subscription.id,
              subscription_status: "active",
            })
            .eq("id", businessId);
        }
        break;
      }

      case "subscription.cancelled": {
        const subscription = event.payload.subscription.entity;
        const businessId = subscription.notes?.business_id;

        if (businessId) {
          await supabase
            .from("businesses")
            .update({
              plan: "free",
              subscription_status: "cancelled",
            })
            .eq("id", businessId);
        }
        break;
      }

      case "subscription.charged": {
        // Payment successful - subscription remains active
        break;
      }

      case "subscription.failed": {
        const subscription = event.payload.subscription.entity;
        const businessId = subscription.notes?.business_id;

        if (businessId) {
          await supabase
            .from("businesses")
            .update({
              subscription_status: "past_due",
            })
            .eq("id", businessId);
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Razorpay webhook error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
