"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Check, Share2, Smartphone } from "lucide-react";
import { useBusiness } from "@/lib/store";

interface UpiQrProps {
  amount: number;
  upiId: string;
  customerName?: string;
}

function generateUpiLink(upiId: string, amount: number, businessName: string): string {
  const params = new URLSearchParams({
    pa: upiId,
    pn: businessName,
    am: amount.toFixed(2),
    cu: "INR",
    tn: "Payment",
  });
  return `upi://pay?${params.toString()}`;
}

export function UpiQr({ amount, upiId, customerName }: UpiQrProps) {
  const { business } = useBusiness();
  const businessName = business?.name || "Bizora Shop";
  const [copied, setCopied] = useState(false);

  const upiLink = generateUpiLink(upiId, amount, businessName);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(upiLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const message = `Please pay ₹${amount.toLocaleString("en-IN")} via UPI:\n\n${upiLink}`;
    const phone = customerName ? "" : "";
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          UPI Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* UPI Link Display */}
        <div className="rounded-lg bg-muted p-4 text-center space-y-2">
          <p className="text-xs text-muted-foreground">Pay via UPI</p>
          <div className="text-2xl font-bold text-primary">
            ₹{amount.toLocaleString("en-IN")}
          </div>
          <p className="text-sm font-mono break-all text-muted-foreground">
            {upiId}
          </p>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={handleCopy} variant="outline" className="gap-2">
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy Link
              </>
            )}
          </Button>
          <Button onClick={handleWhatsApp} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            <Share2 className="h-4 w-4" />
            WhatsApp
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
