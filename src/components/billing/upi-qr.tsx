"use client";

import { useState, useEffect } from "react";
import QRCode from "qrcode";
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
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  const upiLink = generateUpiLink(upiId, amount, businessName);

  useEffect(() => {
    QRCode.toDataURL(upiLink, {
      width: 200,
      margin: 2,
      color: {
        dark: "#0a0a0a",
        light: "#ffffff",
      },
    })
      .then(setQrDataUrl)
      .catch(console.error);
  }, [upiLink]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(upiLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const message = `Please pay ₹${amount.toLocaleString("en-IN")} via UPI:\n\n${upiLink}`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
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
        {/* QR Code */}
        <div className="rounded-lg bg-white p-4 flex flex-col items-center space-y-3 border border-border">
          {qrDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qrDataUrl}
              alt={`UPI QR Code for ₹${amount}`}
              className="w-[180px] h-[180px]"
            />
          ) : (
            <div className="w-[180px] h-[180px] bg-muted animate-pulse rounded-lg" />
          )}
          <div className="text-center">
            <div className="text-2xl font-bold text-[#DC2626]">
              ₹{amount.toLocaleString("en-IN")}
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              {upiId}
            </p>
          </div>
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
          <Button onClick={handleWhatsApp} className="gap-2 bg-[#DC2626] hover:bg-[#B91C1C]">
            <Share2 className="h-4 w-4" />
            WhatsApp
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
