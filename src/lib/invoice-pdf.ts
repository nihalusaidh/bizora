export interface InvoicePdfData {
  invoice_number: string;
  created_at: string;
  status: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  round_off: number;
  total: number;
  amount_paid: number;
  payment_method?: string | null;
  notes?: string | null;
  business?: {
    name: string;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    gst_status?: string | null;
    gstin?: string | null;
  } | null;
  customer?: {
    name: string;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    gst_number?: string | null;
  } | null;
  items: Array<{
    name: string;
    sku?: string | null;
    quantity: number;
    unit: string;
    unit_price: number;
    discount_percent: number;
    tax_rate: number;
    tax_amount: number;
    total: number;
  }>;
}

export function generateInvoiceHtml(data: InvoicePdfData): string {
  const biz = data.business;
  const cust = data.customer;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice ${data.invoice_number}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; color: #1a1a1a; padding: 24px; }
    .header { display: flex; justify-content: space-between; margin-bottom: 32px; }
    .brand { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
    .brand-icon { width: 32px; height: 32px; background: #1a7a4c; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px; }
    .brand-name { font-size: 20px; font-weight: bold; }
    .info { font-size: 12px; color: #666; line-height: 1.6; }
    .invoice-title { text-align: right; }
    .invoice-title h1 { font-size: 28px; color: #1a7a4c; margin-bottom: 4px; }
    .invoice-num { font-size: 16px; font-weight: bold; }
    .meta { display: flex; justify-content: space-between; margin-bottom: 24px; padding: 16px; background: #f9fafb; border-radius: 8px; }
    .meta-section h3 { font-size: 11px; text-transform: uppercase; color: #999; margin-bottom: 4px; letter-spacing: 0.5px; }
    .meta-section p { font-size: 13px; line-height: 1.5; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    th { background: #f3f4f6; padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; color: #666; letter-spacing: 0.5px; }
    th:last-child, td:last-child { text-align: right; }
    td { padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
    .totals { display: flex; justify-content: flex-end; }
    .totals-table { width: 260px; }
    .totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; }
    .totals-row.total { border-top: 2px solid #1a1a1a; padding-top: 10px; margin-top: 6px; font-size: 18px; font-weight: bold; }
    .totals-row.paid { color: #16a34a; }
    .totals-row.due { color: #dc2626; font-weight: bold; }
    .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 11px; color: #999; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">
        <div class="brand-icon">B</div>
        <span class="brand-name">${biz?.name || "BIZORA"}</span>
      </div>
      <div class="info">
        ${biz?.address ? `<p>${biz.address}</p>` : ""}
        ${biz?.phone ? `<p>Phone: ${biz.phone}</p>` : ""}
        ${biz?.email ? `<p>Email: ${biz.email}</p>` : ""}
        ${biz?.gst_status === "registered" && biz?.gstin ? `<p>GSTIN: ${biz.gstin}</p>` : ""}
      </div>
    </div>
    <div class="invoice-title">
      <h1>INVOICE</h1>
      <div class="invoice-num">${data.invoice_number}</div>
      <div class="info" style="text-align: right; margin-top: 4px;">
        Date: ${new Date(data.created_at).toLocaleDateString()}<br>
        Status: ${data.status.toUpperCase()}
      </div>
    </div>
  </div>

  <div class="meta">
    <div class="meta-section">
      <h3>Bill To</h3>
      ${cust ? `
        <p><strong>${cust.name}</strong></p>
        ${cust.phone ? `<p>${cust.phone}</p>` : ""}
        ${cust.email ? `<p>${cust.email}</p>` : ""}
        ${cust.address ? `<p>${cust.address}</p>` : ""}
        ${cust.gst_number ? `<p>GSTIN: ${cust.gst_number}</p>` : ""}
      ` : `<p>Walk-in Customer</p>`}
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Item</th>
        <th>Qty</th>
        <th>Rate</th>
        <th>Disc</th>
        <th>GST</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>
      ${data.items.map((item, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>
            <strong>${item.name}</strong>
            ${item.sku ? `<br><span style="color:#999;font-size:11px">SKU: ${item.sku}</span>` : ""}
          </td>
          <td>${item.quantity} ${item.unit}</td>
          <td>₹${item.unit_price.toFixed(2)}</td>
          <td>${item.discount_percent > 0 ? `${item.discount_percent}%` : "—"}</td>
          <td>${item.tax_rate > 0 ? `${item.tax_rate}%` : "—"}</td>
          <td>₹${item.total.toFixed(2)}</td>
        </tr>
      `).join("")}
    </tbody>
  </table>

  <div class="totals">
    <div class="totals-table">
      <div class="totals-row">
        <span>Subtotal</span>
        <span>₹${data.subtotal.toFixed(2)}</span>
      </div>
      ${data.discount_amount > 0 ? `
        <div class="totals-row" style="color: #16a34a;">
          <span>Discount</span>
          <span>-₹${data.discount_amount.toFixed(2)}</span>
        </div>
      ` : ""}
      ${data.tax_amount > 0 ? `
        <div class="totals-row">
          <span>GST</span>
          <span>₹${data.tax_amount.toFixed(2)}</span>
        </div>
      ` : ""}
      ${data.round_off !== 0 ? `
        <div class="totals-row">
          <span>Round Off</span>
          <span>₹${data.round_off.toFixed(2)}</span>
        </div>
      ` : ""}
      <div class="totals-row total">
        <span>Total</span>
        <span>₹${data.total.toFixed(2)}</span>
      </div>
      ${data.amount_paid > 0 ? `
        <div class="totals-row paid">
          <span>Paid</span>
          <span>-₹${data.amount_paid.toFixed(2)}</span>
        </div>
      ` : ""}
      ${data.total > data.amount_paid ? `
        <div class="totals-row due">
          <span>Balance Due</span>
          <span>₹${(data.total - data.amount_paid).toFixed(2)}</span>
        </div>
      ` : ""}
    </div>
  </div>

  ${data.notes ? `
    <div style="margin-top: 24px; padding: 12px; background: #f9fafb; border-radius: 8px;">
      <strong style="font-size: 12px;">Notes</strong>
      <p style="font-size: 12px; color: #666; margin-top: 4px;">${data.notes}</p>
    </div>
  ` : ""}

  <div class="footer">
    Generated by BIZORA — AI Business Operating System
  </div>
</body>
</html>
  `.trim();
}

export function printInvoice(data: InvoicePdfData) {
  const html = generateInvoiceHtml(data);
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  }
}

export function shareInvoiceViaWhatsApp(data: InvoicePdfData, phone?: string | null) {
  const phoneNumber = phone?.replace(/[^0-9]/g, "");
  if (!phoneNumber) return;

  const lines = [
    `*${data.business?.name || "Invoice"}*`,
    ``,
    `Invoice: ${data.invoice_number}`,
    `Date: ${new Date(data.created_at).toLocaleDateString()}`,
    ``,
    `*Items:*`,
    ...data.items.map(
      (item) => `${item.name} x${item.quantity} = ₹${item.total.toFixed(2)}`
    ),
    ``,
    `Subtotal: ₹${data.subtotal.toFixed(2)}`,
  ];

  if (data.discount_amount > 0) {
    lines.push(`Discount: -₹${data.discount_amount.toFixed(2)}`);
  }
  if (data.tax_amount > 0) {
    lines.push(`GST: ₹${data.tax_amount.toFixed(2)}`);
  }

  lines.push(
    ``,
    `*Total: ₹${data.total.toFixed(2)}*`,
  );

  if (data.amount_paid > 0) {
    lines.push(`Paid: ₹${data.amount_paid.toFixed(2)}`);
  }
  if (data.total > data.amount_paid) {
    lines.push(`*Balance Due: ₹${(data.total - data.amount_paid).toFixed(2)}*`);
  }

  const message = encodeURIComponent(lines.join("\n"));
  window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
}
