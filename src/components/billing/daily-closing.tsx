"use client";

import { useState, useEffect } from "react";
import { useBusiness } from "@/lib/store";
import {
  getDailyClosingData,
  type DailyClosingData,
} from "@/server/actions/daily-closing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Printer,
  MessageCircle,
  Loader2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  IndianRupee,
  Receipt,
  ShoppingCart,
  CreditCard,
  Banknote,
  Undo2,
  Wallet,
} from "lucide-react";

function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export function DailyClosing() {
  const { businessId, business } = useBusiness();
  const [data, setData] = useState<DailyClosingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!businessId) return;
    setLoading(true);
    getDailyClosingData(businessId, today)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [businessId, today]);

  function handlePrint() {
    if (!data) return;
    const receiptText = generateClosingReportText(data, business?.name || "Shop");
    const printWindow = window.open("", "_blank", "width=400,height=600");
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Daily Closing - ${data.date}</title>
          <style>
            @page { size: 80mm auto; margin: 0; }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Courier New', Courier, monospace;
              font-size: 11px;
              line-height: 1.3;
              width: 80mm;
              padding: 2mm;
              color: #000;
              background: #fff;
            }
            pre { white-space: pre; font-family: inherit; font-size: inherit; }
            @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          <pre>${receiptText.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
        </body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 300);
    }
  }

  function handleWhatsApp() {
    if (!data) return;
    const reportText = generateClosingReportText(data, business?.name || "Shop");
    const message = encodeURIComponent(reportText);
    window.open(`https://wa.me/?text=${message}`, "_blank");
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-sm text-destructive">
          {error}
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const netProfitColor = data.netProfit >= 0 ? "text-green-500" : "text-destructive";

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Daily Closing</h2>
          <p className="text-sm text-muted-foreground">
            {new Date(data.date + "T00:00:00").toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="mr-1.5 h-3.5 w-3.5" />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleWhatsApp}>
            <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
            Share
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card size="sm">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Receipt className="h-3.5 w-3.5" />
              <span className="text-xs">Total Sales</span>
            </div>
            <div className="text-xl font-bold">{formatCurrency(data.totalSales)}</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {data.billCount} bills · Avg {formatCurrency(data.averageBillValue)}
            </div>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              {data.netProfit >= 0 ? (
                <TrendingUp className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-destructive" />
              )}
              <span className="text-xs">Net Profit</span>
            </div>
            <div className={`text-xl font-bold ${netProfitColor}`}>
              {formatCurrency(data.netProfit)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Collection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Banknote className="h-4 w-4 text-green-500" />
              <span className="text-sm">Cash</span>
            </div>
            <span className="font-semibold">{formatCurrency(data.cashCollected)}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-blue-500" />
              <span className="text-sm">UPI</span>
            </div>
            <span className="font-semibold">{formatCurrency(data.upiCollected)}</span>
          </div>
          {data.cardCollected > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-purple-500" />
                <span className="text-sm">Card / Bank</span>
              </div>
              <span className="font-semibold">{formatCurrency(data.cardCollected)}</span>
            </div>
          )}
          {data.creditSales > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-orange-500" />
                <span className="text-sm">Credit (Udhaar)</span>
              </div>
              <span className="font-semibold text-orange-500">
                {formatCurrency(data.creditSales)}
              </span>
            </div>
          )}
          {data.totalReturns > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Undo2 className="h-4 w-4 text-destructive" />
                <span className="text-sm">Returns</span>
              </div>
              <span className="font-semibold text-destructive">
                {formatCurrency(data.totalReturns)}
              </span>
            </div>
          )}
          <div className="border-t pt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Expenses</span>
            </div>
            <span className="font-semibold text-destructive">
              {formatCurrency(data.totalExpenses)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Top Selling Products */}
      {data.topSellingProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.topSellingProducts.map((product, index) => (
              <div
                key={product.name + index}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="h-5 w-5 justify-center p-0 text-xs">
                    {index + 1}
                  </Badge>
                  <span className="text-sm truncate max-w-[180px]">
                    {product.name}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-muted-foreground">
                    {product.quantity} sold
                  </span>
                  <span className="font-medium">{formatCurrency(product.revenue)}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Low Stock Alerts */}
      {data.lowStockItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.lowStockItems.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between text-sm"
              >
                <span className="truncate max-w-[200px]">{item.name}</span>
                <Badge
                  variant={item.stock === 0 ? "destructive" : "outline"}
                  className="text-xs"
                >
                  {item.stock} {item.unit}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function generateClosingReportText(
  data: DailyClosingData,
  shopName: string
): string {
  const w = 48;
  const lines: string[] = [];

  const padRight = (s: string, l: number) =>
    s.length >= l ? s.slice(0, l) : s + " ".repeat(l - s.length);
  const padLeft = (s: string, l: number) =>
    s.length >= l ? s.slice(0, l) : " ".repeat(l - s.length) + s;
  const center = (s: string, l: number) => {
    if (s.length >= l) return s.slice(0, l);
    const left = Math.floor((l - s.length) / 2);
    return " ".repeat(left) + s + " ".repeat(l - s.length - left);
  };
  const dash = () => "-".repeat(w);

  lines.push(center("DAILY CLOSING REPORT", w));
  lines.push(center(shopName.toUpperCase(), w));
  lines.push(center(data.date, w));
  lines.push(dash());

  lines.push(padRight("Total Sales:", w - 12) + padLeft(`₹${data.totalSales.toFixed(0)}`, 12));
  lines.push(padRight("Bills:", w - 12) + padLeft(String(data.billCount), 12));
  lines.push(padRight("Avg Bill:", w - 12) + padLeft(`₹${data.averageBillValue.toFixed(0)}`, 12));
  lines.push(dash());

  lines.push("PAYMENT COLLECTION:");
  lines.push(padRight("  Cash:", w - 12) + padLeft(`₹${data.cashCollected.toFixed(0)}`, 12));
  lines.push(padRight("  UPI:", w - 12) + padLeft(`₹${data.upiCollected.toFixed(0)}`, 12));
  if (data.cardCollected > 0) {
    lines.push(padRight("  Card/Bank:", w - 12) + padLeft(`₹${data.cardCollected.toFixed(0)}`, 12));
  }
  if (data.creditSales > 0) {
    lines.push(padRight("  Credit:", w - 12) + padLeft(`₹${data.creditSales.toFixed(0)}`, 12));
  }
  if (data.totalReturns > 0) {
    lines.push(padRight("  Returns:", w - 12) + padLeft(`₹${data.totalReturns.toFixed(0)}`, 12));
  }
  lines.push(dash());

  lines.push(padRight("Expenses:", w - 12) + padLeft(`₹${data.totalExpenses.toFixed(0)}`, 12));
  if (data.totalTax > 0) {
    lines.push(padRight("GST Collected:", w - 12) + padLeft(`₹${data.totalTax.toFixed(0)}`, 12));
  }
  lines.push(dash());

  const profitLabel = data.netProfit >= 0 ? "NET PROFIT:" : "NET LOSS:";
  lines.push(center(`${profitLabel} ₹${Math.abs(data.netProfit).toFixed(0)}`, w));

  if (data.topSellingProducts.length > 0) {
    lines.push(dash());
    lines.push("TOP SELLING:");
    data.topSellingProducts.forEach((p, i) => {
      lines.push(`  ${i + 1}. ${p.name.slice(0, 28)} x${p.quantity}`);
    });
  }

  if (data.lowStockItems.length > 0) {
    lines.push(dash());
    lines.push("LOW STOCK:");
    data.lowStockItems.forEach((item) => {
      lines.push(`  - ${item.name.slice(0, 30)}: ${item.stock} ${item.unit}`);
    });
  }

  lines.push(dash());
  lines.push(center("Generated by BIZORA", w));

  return lines.join("\n");
}
