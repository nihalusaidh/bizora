import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  sendInviteEmail,
  sendPaymentReminder,
  sendInvoiceEmail,
  sendLowStockAlert,
} from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, to, data } = await request.json();

    if (!type || !to) {
      return NextResponse.json({ error: "Missing type or to" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const VALID_EMAIL_TYPES = ["invite", "payment-reminder", "invoice", "low-stock"] as const;
    if (!VALID_EMAIL_TYPES.includes(type)) {
      return NextResponse.json({ error: "Invalid email type" }, { status: 400 });
    }

    const { data: recentEmails } = await supabase
      .from("email_logs")
      .select("id")
      .eq("user_id", user.id)
      .gte("created_at", new Date(Date.now() - 60 * 60 * 1000).toISOString());

    if (recentEmails && recentEmails.length >= 50) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    let result;

    switch (type) {
      case "invite":
        result = await sendInviteEmail(
          to,
          data.businessName,
          data.inviterName,
          data.role
        );
        break;

      case "payment-reminder":
        result = await sendPaymentReminder(
          to,
          data.customerName,
          data.amount,
          data.invoiceNumber,
          data.businessName
        );
        break;

      case "invoice":
        result = await sendInvoiceEmail(
          to,
          data.customerName,
          data.invoiceNumber,
          data.amount,
          data.businessName,
          data.downloadUrl
        );
        break;

      case "low-stock":
        result = await sendLowStockAlert(
          to,
          data.productName,
          data.currentStock,
          data.businessName
        );
        break;

      default:
        break;
    }

    return NextResponse.json({ success: true, id: (result as { id?: string })?.id });
  } catch (error) {
    console.error("Email send error:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
