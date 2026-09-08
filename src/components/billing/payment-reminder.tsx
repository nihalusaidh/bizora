"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";
import { useBusiness } from "@/lib/store";

interface PaymentReminderProps {
  customerName: string;
  customerPhone: string;
  outstandingAmount: number;
}

function generateReminderMessage(
  customerName: string,
  businessName: string,
  amount: number
): string {
  return `Namaste ${customerName} ji, this is a friendly reminder from ${businessName}. Your outstanding balance is ₹${amount.toLocaleString("en-IN")}. Please make the payment at your convenience. Thank you! 🙏`;
}

export function PaymentReminder({
  customerName,
  customerPhone,
  outstandingAmount,
}: PaymentReminderProps) {
  const { business } = useBusiness();
  const businessName = business?.name || "Bizora Shop";

  const message = generateReminderMessage(customerName, businessName, outstandingAmount);

  const handleSendWhatsApp = () => {
    const cleanPhone = customerPhone.replace(/\D/g, "");
    const internationalPhone = cleanPhone.startsWith("91")
      ? cleanPhone
      : `91${cleanPhone}`;
    const url = `https://wa.me/${internationalPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-emerald-600" />
          Payment Reminder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-muted p-4 space-y-1">
          <p className="text-sm leading-relaxed">{message}</p>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Outstanding:</span>
          <span className="font-bold text-destructive">
            ₹{outstandingAmount.toLocaleString("en-IN")}
          </span>
        </div>

        <Button
          onClick={handleSendWhatsApp}
          className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700"
        >
          <MessageCircle className="h-4 w-4" />
          Send Reminder on WhatsApp
        </Button>
      </CardContent>
    </Card>
  );
}
