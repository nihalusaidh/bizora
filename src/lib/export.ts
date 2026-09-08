export function downloadCsv(data: Record<string, unknown>[], filename: string) {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((h) => {
          const val = row[h];
          const str = val === null || val === undefined ? "" : String(val);
          // Escape quotes and wrap in quotes if contains comma, newline, or quote
          if (str.includes(",") || str.includes("\n") || str.includes('"')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function formatProductsForCsv(products: Array<Record<string, unknown>>) {
  return products.map((p) => ({
    Name: p.name,
    SKU: p.sku || "",
    Barcode: p.barcode || "",
    Brand: p.brand || "",
    Category: (p.category as { name?: string } | null)?.name || "",
    "Cost Price": p.cost_price,
    "Selling Price": p.selling_price,
    "GST Rate": p.gst_rate,
    Stock: p.stock_quantity,
    "Min Stock": p.min_stock,
    Active: p.is_active ? "Yes" : "No",
  }));
}

export function formatCustomersForCsv(customers: Array<Record<string, unknown>>) {
  return customers.map((c) => ({
    Name: c.name,
    Phone: c.phone || "",
    Email: c.email || "",
    Address: c.address || "",
    "GST Number": c.gst_number || "",
    "Outstanding Balance": c.outstanding_balance,
    "Total Spend": c.total_spend,
    "Purchase Count": c.purchase_count,
    "Preferred Delivery": c.preferred_delivery || "",
    Notes: c.notes || "",
  }));
}

export function formatInvoicesForCsv(invoices: Array<Record<string, unknown>>) {
  return invoices.map((i) => ({
    "Invoice Number": i.invoice_number,
    Date: new Date(i.created_at as string).toLocaleDateString(),
    Customer: (i.customers as { name?: string } | null)?.name || "Walk-in",
    Status: i.status,
    Subtotal: i.subtotal,
    Discount: i.discount_amount,
    Tax: i.tax_amount,
    Total: i.total,
    "Amount Paid": i.amount_paid,
    Balance: Number(i.total) - Number(i.amount_paid),
    "Payment Method": i.payment_method || "",
  }));
}

export function formatExpensesForCsv(expenses: Array<Record<string, unknown>>) {
  return expenses.map((e) => ({
    Date: e.expense_date,
    Description: e.description,
    Category: (e.expense_categories as { name?: string } | null)?.name || "",
    Amount: e.amount,
    "Payment Method": e.payment_method,
    Vendor: e.vendor || "",
    Reference: e.reference || "",
    Notes: e.notes || "",
    Recurring: e.is_recurring ? "Yes" : "No",
    "Recurring Period": e.recurring_period || "",
  }));
}
