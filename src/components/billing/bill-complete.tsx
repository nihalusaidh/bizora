"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, MessageCircle, Printer, Download, ArrowRight, Home, ChevronDown, ChevronUp, Gift, Smartphone } from "lucide-react";
import Link from "next/link";
import { printInvoice, shareInvoiceViaWhatsApp, type InvoicePdfData } from "@/lib/invoice-pdf";
import { UpiQr } from "@/components/billing/upi-qr";

interface BillCompleteProps {
  invoice: InvoicePdfData;
  amountPaid: number;
  pointsEarned?: number;
  upiId?: string;
}

export function BillComplete({ invoice, amountPaid, pointsEarned, upiId }: BillCompleteProps) {
  const balance = invoice.total - amountPaid;
  const [showUpi, setShowUpi] = useState(false);

  const handlePrint = () => {
    printInvoice(invoice);
  };

  const handleWhatsApp = () => {
    shareInvoiceViaWhatsApp(invoice, invoice.customer?.phone);
  };

  const handleDownload = () => {
    const { generateInvoiceHtml } = require("@/lib/invoice-pdf");
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(generateInvoiceHtml(invoice));
      printWindow.document.close();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
      <Card className="w-full max-w-md mx-4 animate-scale-in">
        <CardContent className="p-6 text-center">
          {/* Success Icon */}
          <div className="mx-auto h-16 w-16 rounded-full bg-success-soft flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-success" />
          </div>

          <h2 className="text-xl font-bold mb-1">Bill Complete</h2>
          <div className="text-3xl font-bold text-primary mb-1">₹{invoice.total.toLocaleString("en-IN")}</div>
          <p className="text-sm text-muted-foreground mb-1">Invoice #{invoice.invoice_number}</p>

          {balance > 0 && (
            <div className="inline-flex items-center gap-1 rounded-full bg-warning-soft px-3 py-1 text-xs font-medium text-warning mb-4">
              Balance due: ₹{balance.toLocaleString("en-IN")}
            </div>
          )}

          {pointsEarned && pointsEarned > 0 && (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-medium text-amber-700 mb-4">
              <Gift className="h-3.5 w-3.5" />
              You earned {pointsEarned} points!
            </div>
          )}

          {/* What would you like to do? */}
          <div className="mt-6 space-y-2">
            <p className="text-sm font-medium text-muted-foreground mb-3">What would you like to do?</p>

            {invoice.customer?.phone && (
              <Button onClick={handleWhatsApp} className="w-full justify-start gap-3" size="lg">
                <MessageCircle className="h-4 w-4" />
                Send on WhatsApp
              </Button>
            )}

            <Button onClick={handlePrint} variant="outline" className="w-full justify-start gap-3" size="lg">
              <Printer className="h-4 w-4" />
              Print Invoice
            </Button>

            {invoice.customer?.phone && (
              <Button
                onClick={() => { handleWhatsApp(); handlePrint(); }}
                variant="outline"
                className="w-full justify-start gap-3"
                size="lg"
              >
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  <span>+</span>
                  <Printer className="h-4 w-4" />
                </div>
                Send & Print
              </Button>
            )}

            <Button onClick={handleDownload} variant="ghost" className="w-full justify-start gap-3" size="lg">
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </div>

          {/* UPI Payment Section */}
          {upiId && (
            <div className="mt-4">
              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => setShowUpi(!showUpi)}
              >
                <span className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Pay via UPI
                </span>
                {showUpi ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
              {showUpi && (
                <div className="mt-3">
                  <Card className="border border-border/50">
                    <CardContent className="p-4">
                      <UpiQr amount={invoice.total} upiId={upiId} />
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* Done */}
          <div className="mt-6 pt-4 border-t flex gap-2">
            <Link href="/dashboard" className="flex-1">
              <Button variant="outline" className="w-full">
                <Home className="mr-2 h-4 w-4" />
                Home
              </Button>
            </Link>
            <Link href="/billing" className="flex-1">
              <Button className="w-full">
                New Bill
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
