"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getInvoice, updateInvoiceStatus, deleteInvoice } from "@/server/actions/invoices";
import { useBusiness } from "@/lib/store";
import { printInvoice, shareInvoiceViaWhatsApp, type InvoicePdfData } from "@/lib/invoice-pdf";
import { ArrowLeft, Printer, Send, CheckCircle, Trash2, Download, MessageCircle, Smartphone } from "lucide-react";
import { printThermalReceipt, type ThermalReceiptData } from "@/components/billing/thermal-receipt";
import { UpiQr } from "@/components/billing/upi-qr";

interface InvoiceItem {
  id: string;
  name: string;
  sku?: string | null;
  quantity: number;
  unit: string;
  unit_price: number;
  discount_percent: number;
  discount_amount: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
}

interface InvoiceData {
  id: string;
  invoice_number: string;
  status: string;
  subtotal: number;
  discount_amount: number;
  discount_percent: number;
  tax_amount: number;
  round_off: number;
  total: number;
  amount_paid: number;
  payment_method?: string | null;
  delivery_method?: string;
  notes?: string | null;
  terms?: string | null;
  created_at: string;
  customers?: {
    name: string;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    gst_number?: string | null;
  } | null;
  invoice_items: InvoiceItem[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-gray-100 text-gray-700" },
  sent: { label: "Sent", color: "bg-blue-100 text-blue-700" },
  paid: { label: "Paid", color: "bg-green-100 text-green-700" },
  partial: { label: "Partial", color: "bg-yellow-100 text-yellow-700" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700" },
  returned: { label: "Returned", color: "bg-orange-100 text-orange-700" },
};

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { businessId, business } = useBusiness();
  const invoiceId = params.id as string;

  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadInvoice = useCallback(async () => {
    if (!businessId || !invoiceId) return;
    setLoading(true);
    try {
      const data = await getInvoice(businessId, invoiceId);
      setInvoice(data);
    } catch (err) {
      console.error("Failed to load invoice:", err);
    } finally {
      setLoading(false);
    }
  }, [businessId, invoiceId]);

  useEffect(() => {
    loadInvoice();
  }, [loadInvoice]);

  const handleMarkPaid = async () => {
    if (!businessId || !invoice) return;
    try {
      await updateInvoiceStatus(businessId, invoice.id, "paid", invoice.total);
      loadInvoice();
    } catch (err) {
      console.error("Failed to mark paid:", err);
    }
  };

  const handleDelete = async () => {
    if (!businessId || !invoice) return;
    if (!confirm("Delete this invoice?")) return;
    try {
      await deleteInvoice(businessId, invoice.id);
      router.push("/billing/invoices");
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handlePrintInvoice = () => {
    if (!invoice) return;
    const pdfData: InvoicePdfData = {
      invoice_number: invoice.invoice_number,
      created_at: invoice.created_at,
      status: invoice.status,
      subtotal: invoice.subtotal,
      discount_amount: invoice.discount_amount,
      tax_amount: invoice.tax_amount,
      round_off: invoice.round_off,
      total: invoice.total,
      amount_paid: invoice.amount_paid,
      payment_method: invoice.payment_method,
      notes: invoice.notes,
      business: business as InvoicePdfData["business"],
      customer: invoice.customers as InvoicePdfData["customer"],
      items: invoice.invoice_items,
    };
    printInvoice(pdfData);
  };

  const handleWhatsAppShare = () => {
    if (!invoice) return;
    const pdfData: InvoicePdfData = {
      invoice_number: invoice.invoice_number,
      created_at: invoice.created_at,
      status: invoice.status,
      subtotal: invoice.subtotal,
      discount_amount: invoice.discount_amount,
      tax_amount: invoice.tax_amount,
      round_off: invoice.round_off,
      total: invoice.total,
      amount_paid: invoice.amount_paid,
      payment_method: invoice.payment_method,
      notes: invoice.notes,
      business: business as InvoicePdfData["business"],
      customer: invoice.customers as InvoicePdfData["customer"],
      items: invoice.invoice_items,
    };
    shareInvoiceViaWhatsApp(pdfData, invoice.customers?.phone);
  };

  const handleThermalPrint = () => {
    if (!invoice) return;
    const created = new Date(invoice.created_at);
    const thermalData: ThermalReceiptData = {
      shopName: business?.name || "Bizora Shop",
      shopAddress: business?.address || undefined,
      shopPhone: business?.phone || undefined,
      shopGstin: business?.gst_status === "registered" ? business?.gstin || undefined : undefined,
      invoiceNumber: invoice.invoice_number,
      date: created.toLocaleDateString(),
      time: created.toLocaleTimeString(),
      items: invoice.invoice_items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        unitPrice: item.unit_price,
        discount: item.discount_percent || undefined,
        taxRate: item.tax_rate || undefined,
        total: item.total,
      })),
      subtotal: invoice.subtotal,
      discount: invoice.discount_amount,
      tax: invoice.tax_amount,
      roundOff: invoice.round_off,
      total: invoice.total,
      amountPaid: invoice.amount_paid,
      paymentMethod: invoice.payment_method || undefined,
      customerName: invoice.customers?.name || undefined,
      customerPhone: invoice.customers?.phone || undefined,
      upiId: business?.upi_id || undefined,
    };
    printThermalReceipt(thermalData);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-32 bg-muted animate-pulse rounded" />
        <div className="h-96 bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="space-y-6">
        <Link href="/billing/invoices" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Invoices
        </Link>
        <div className="rounded-xl border bg-card p-8 text-center">
          <h3 className="text-lg font-semibold mb-2">Invoice not found</h3>
          <Link href="/billing/invoices"><Button>Go to Invoices</Button></Link>
        </div>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[invoice.status] || STATUS_CONFIG.draft;

  return (
    <div className="space-y-6">
      {/* Header (hidden on print) */}
      <div className="flex items-center justify-between print:hidden">
        <Link href="/billing/invoices" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
          </Button>
          {invoice.status !== "paid" && invoice.status !== "cancelled" && (
            <Button size="sm" onClick={handleMarkPaid}>
              <CheckCircle className="mr-2 h-4 w-4" /> Mark Paid
            </Button>
          )}
          <Button variant="outline" size="icon" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Invoice Content */}
      <Card id="invoice-content">
        <CardContent className="p-6 md:p-8">
          {/* Business Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold">B</span>
                </div>
                <span className="text-2xl font-bold">{business?.name || "BIZORA"}</span>
              </div>
              {business?.address && <p className="text-sm text-muted-foreground">{business.address}</p>}
              {business?.phone && <p className="text-sm text-muted-foreground">{business.phone}</p>}
              {business?.email && <p className="text-sm text-muted-foreground">{business.email}</p>}
              {business?.gst_status === "registered" && business?.gstin && (
                <p className="text-sm font-medium">GSTIN: {business.gstin}</p>
              )}
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-bold text-primary mb-1">INVOICE</h2>
              <div className="text-lg font-mono font-bold">{invoice.invoice_number}</div>
              <div className="text-sm text-muted-foreground mt-1">
                Date: {new Date(invoice.created_at).toLocaleDateString()}
              </div>
              <div className="mt-2">
                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${statusCfg.color}`}>
                  {statusCfg.label}
                </span>
              </div>
            </div>
          </div>

          {/* Bill To */}
          <div className="mb-8">
            <div className="text-sm font-semibold text-muted-foreground mb-1">BILL TO</div>
            {invoice.customers ? (
              <div>
                <div className="font-semibold">{invoice.customers.name}</div>
                {invoice.customers.phone && <div className="text-sm">{invoice.customers.phone}</div>}
                {invoice.customers.email && <div className="text-sm">{invoice.customers.email}</div>}
                {invoice.customers.address && <div className="text-sm">{invoice.customers.address}</div>}
                {invoice.customers.gst_number && (
                  <div className="text-sm font-medium">GSTIN: {invoice.customers.gst_number}</div>
                )}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Walk-in Customer</div>
            )}
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-semibold">#</th>
                  <th className="text-left py-2 font-semibold">Item</th>
                  <th className="text-right py-2 font-semibold">Qty</th>
                  <th className="text-right py-2 font-semibold">Rate</th>
                  <th className="text-right py-2 font-semibold">Disc</th>
                  <th className="text-right py-2 font-semibold">GST</th>
                  <th className="text-right py-2 font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.invoice_items.map((item, index) => (
                  <tr key={item.id} className="border-b">
                    <td className="py-2 text-muted-foreground">{index + 1}</td>
                    <td className="py-2">
                      <div className="font-medium">{item.name}</div>
                      {item.sku && <div className="text-xs text-muted-foreground">SKU: {item.sku}</div>}
                    </td>
                    <td className="py-2 text-right">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="py-2 text-right">₹{item.unit_price.toFixed(2)}</td>
                    <td className="py-2 text-right">
                      {item.discount_percent > 0 ? `${item.discount_percent}%` : "—"}
                    </td>
                    <td className="py-2 text-right">
                      {item.tax_rate > 0 ? `${item.tax_rate}%` : "—"}
                    </td>
                    <td className="py-2 text-right font-medium">₹{item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-72 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{invoice.subtotal.toFixed(2)}</span>
              </div>
              {invoice.discount_amount > 0 && (
                <div className="flex justify-between text-sm text-green-500">
                  <span>Discount</span>
                  <span>-₹{invoice.discount_amount.toFixed(2)}</span>
                </div>
              )}
              {invoice.tax_amount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">GST</span>
                  <span>₹{invoice.tax_amount.toFixed(2)}</span>
                </div>
              )}
              {invoice.round_off !== 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Round Off</span>
                  <span>₹{invoice.round_off.toFixed(2)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span>₹{invoice.total.toFixed(2)}</span>
              </div>
              {invoice.amount_paid > 0 && (
                <>
                  <div className="flex justify-between text-sm text-green-500">
                    <span>Paid</span>
                    <span>-₹{invoice.amount_paid.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-orange-500">
                    <span>Balance Due</span>
                    <span>₹{(invoice.total - invoice.amount_paid).toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Notes & Terms */}
          {(invoice.notes || invoice.terms) && (
            <div className="mt-8 pt-6 border-t grid grid-cols-2 gap-8">
              {invoice.notes && (
                <div>
                  <div className="text-sm font-semibold mb-1">Notes</div>
                  <div className="text-sm text-muted-foreground">{invoice.notes}</div>
                </div>
              )}
              {invoice.terms && (
                <div>
                  <div className="text-sm font-semibold mb-1">Terms & Conditions</div>
                  <div className="text-sm text-muted-foreground">{invoice.terms}</div>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t text-center text-xs text-muted-foreground">
            Generated by BIZORA — AI Business Operating System
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons (hidden on print) */}
      <div className="flex gap-3 print:hidden">
        <Button variant="outline" className="flex-1" onClick={handlePrintInvoice}>
          <Printer className="mr-2 h-4 w-4" />
          Print Invoice
        </Button>
        <Button variant="outline" className="flex-1" onClick={handleThermalPrint}>
          <Printer className="mr-2 h-4 w-4" />
          Thermal Print
        </Button>
        {invoice.customers?.phone && (
          <Button variant="outline" className="flex-1" onClick={handleWhatsAppShare}>
            <MessageCircle className="mr-2 h-4 w-4" />
            WhatsApp
          </Button>
        )}
        {invoice.status !== "paid" && invoice.status !== "cancelled" && (
          <Button className="flex-1" onClick={handleMarkPaid}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Mark as Paid
          </Button>
        )}
      </div>

      {/* UPI QR Section */}
      {invoice.status !== "paid" && invoice.status !== "cancelled" && business?.upi_id && (
        <Card className="print:hidden">
          <CardContent className="p-6">
            <UpiQr amount={invoice.total} upiId={business.upi_id} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
