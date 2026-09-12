import { NextRequest, NextResponse } from "next/server";
import {
  sendInviteEmail,
  sendPaymentReminder,
  sendInvoiceEmail,
  sendLowStockAlert,
} from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { type, to, data } = await request.json();

    if (!type || !to) {
      return NextResponse.json({ error: "Missing type or to" }, { status: 400 });
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
        return NextResponse.json({ error: "Invalid email type" }, { status: 400 });
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
