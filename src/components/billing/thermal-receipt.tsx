"use client";

export interface ThermalReceiptData {
  shopName: string;
  shopAddress?: string;
  shopPhone?: string;
  shopGstin?: string;
  invoiceNumber: string;
  date: string;
  time: string;
  items: Array<{
    name: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    discount?: number;
    taxRate?: number;
    total: number;
  }>;
  subtotal: number;
  discount: number;
  tax: number;
  roundOff: number;
  total: number;
  amountPaid: number;
  paymentMethod?: string;
  customerName?: string;
  customerPhone?: string;
  upiId?: string;
  thankYouMessage?: string;
  width?: "80mm" | "58mm";
}

function padRight(str: string, len: number): string {
  if (str.length >= len) return str.slice(0, len);
  return str + " ".repeat(len - str.length);
}

function padLeft(str: string, len: number): string {
  if (str.length >= len) return str.slice(0, len);
  return " ".repeat(len - str.length) + str;
}

function center(str: string, len: number): string {
  if (str.length >= len) return str.slice(0, len);
  const leftPad = Math.floor((len - str.length) / 2);
  return " ".repeat(leftPad) + str + " ".repeat(len - str.length - leftPad);
}

function line(len: number): string {
  return "-".repeat(len);
}

function dashedLine(len: number): string {
  return "·".repeat(len);
}

export function generateReceiptText(data: ThermalReceiptData): string {
  const w = data.width === "58mm" ? 32 : 48;
  const lines: string[] = [];

  lines.push(center(data.shopName.toUpperCase(), w));
  if (data.shopAddress) lines.push(center(data.shopAddress, w));
  if (data.shopPhone) lines.push(center(`Ph: ${data.shopPhone}`, w));
  if (data.shopGstin) lines.push(center(`GSTIN: ${data.shopGstin}`, w));

  lines.push(line(w));
  lines.push(`Bill #: ${data.invoiceNumber}`);
  lines.push(`Date: ${data.date}  Time: ${data.time}`);
  if (data.customerName) lines.push(`Customer: ${data.customerName}`);
  lines.push(line(w));

  // Header row
  lines.push(
    padRight("Item", w - 12) + padLeft("Qty", 4) + padLeft("Total", 8)
  );
  lines.push(dashedLine(w));

  // Items
  for (const item of data.items) {
    const nameStr =
      item.name.length > w - 14
        ? item.name.slice(0, w - 17) + "..."
        : item.name;
    lines.push(padRight(nameStr, w - 12) + padLeft(String(item.quantity), 4) + padLeft(`₹${item.total.toFixed(0)}`, 8));

    // Show unit price if needed
    if (item.discount && item.discount > 0) {
      lines.push(
        padRight(`  @₹${item.unitPrice.toFixed(0)}`, w - 12) +
          padLeft("", 4) +
          padLeft(`-${item.discount.toFixed(0)}%`, 8)
      );
    }
    if (item.taxRate && item.taxRate > 0) {
      lines.push(
        padRight(`  incl ${item.taxRate}% GST`, w - 12) +
          padLeft("", 4) +
          padLeft("", 8)
      );
    }
  }

  lines.push(line(w));
  lines.push(
    padRight("Subtotal", w - 10) + padLeft(`₹${data.subtotal.toFixed(2)}`, 10)
  );

  if (data.discount > 0) {
    lines.push(
      padRight("Discount", w - 10) + padLeft(`-₹${data.discount.toFixed(2)}`, 10)
    );
  }

  if (data.tax > 0) {
    lines.push(
      padRight("GST", w - 10) + padLeft(`₹${data.tax.toFixed(2)}`, 10)
    );
  }

  if (data.roundOff !== 0) {
    lines.push(
      padRight("Round Off", w - 10) + padLeft(`₹${data.roundOff.toFixed(2)}`, 10)
    );
  }

  lines.push(line(w));
  lines.push(
    padRight("TOTAL", w - 10) + padLeft(`₹${data.total.toFixed(2)}`, 10)
  );
  lines.push(line(w));

  lines.push(
    padRight("Paid", w - 10) + padLeft(`₹${data.amountPaid.toFixed(2)}`, 10)
  );
  if (data.total > data.amountPaid) {
    lines.push(
      padRight("Balance", w - 10) +
        padLeft(`₹${(data.total - data.amountPaid).toFixed(2)}`, 10)
    );
  }
  if (data.paymentMethod) {
    lines.push(`Payment: ${data.paymentMethod.toUpperCase()}`);
  }

  lines.push(line(w));

  if (data.upiId) {
    lines.push(center("Scan to Pay", w));
    lines.push(center(`UPI: ${data.upiId}`, w));
    lines.push(center(`Amount: ₹${data.total.toFixed(2)}`, w));
    lines.push(line(w));
  }

  lines.push(
    center(data.thankYouMessage || "Thank you for shopping with us!", w)
  );
  lines.push(center("Visit us again", w));

  return lines.join("\n");
}

export function printThermalReceipt(data: ThermalReceiptData) {
  const receiptText = generateReceiptText(data);
  const printWindow = window.open("", "_blank", "width=320,height=600");
  if (printWindow) {
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt ${data.invoiceNumber}</title>
        <style>
          @page {
            size: ${data.width === "58mm" ? "58mm" : "80mm"} auto;
            margin: 0;
          }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Courier New', Courier, monospace;
            font-size: ${data.width === "58mm" ? "10px" : "12px"};
            line-height: 1.3;
            width: ${data.width === "58mm" ? "58mm" : "80mm"};
            padding: 2mm;
            color: #000;
            background: #fff;
          }
          pre {
            white-space: pre;
            font-family: inherit;
            font-size: inherit;
            line-height: inherit;
          }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <pre>${receiptText.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
      </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 300);
  }
}

export function shareReceiptWhatsApp(data: ThermalReceiptData, phone?: string) {
  const phoneNumber = phone?.replace(/[^0-9]/g, "");
  if (!phoneNumber) return;

  const receiptText = generateReceiptText(data);
  const message = encodeURIComponent(receiptText);
  window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
}

export function ThermalReceipt({ data }: { data: ThermalReceiptData }) {
  const receiptText = generateReceiptText(data);

  return (
    <div className="rounded-lg border bg-white p-4 font-mono text-xs text-black">
      <pre className="whitespace-pre overflow-x-auto">{receiptText}</pre>
    </div>
  );
}
