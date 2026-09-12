"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { useBusiness } from "@/lib/store";
import { toCSV, downloadCSV } from "@/lib/csv-utils";
import { ArrowLeft, Download, Package, Users, Receipt, CreditCard, Building2 } from "lucide-react";

const EXPORTS = [
  { key: "products", label: "Products", icon: Package, columns: ["name", "sku", "barcode", "cost_price", "selling_price", "stock_quantity", "gst_rate", "hsn_sac"] },
  { key: "customers", label: "Customers", icon: Users, columns: ["name", "phone", "email", "address", "city", "gstin", "credit_limit"] },
  { key: "invoices", label: "Invoices", icon: Receipt, columns: ["invoice_number", "customer_name", "subtotal", "gst_amount", "total", "status", "invoice_date"] },
  { key: "expenses", label: "Expenses", icon: CreditCard, columns: ["description", "amount", "category_name", "expense_date", "payment_method"] },
  { key: "suppliers", label: "Suppliers", icon: Building2, columns: ["name", "phone", "email", "address", "gstin"] },
];

export default function DataExportPage() {
  const { businessId } = useBusiness();
  const [exporting, setExporting] = useState<string | null>(null);

  const handleExport = async (key: string, label: string, columns: string[]) => {
    if (!businessId) return;
    setExporting(key);
    try {
      const supabase = createClient();
      const { data } = await supabase.from(key).select("*").eq("business_id", businessId);
      if (!data?.length) { alert(`No ${label.toLowerCase()} to export`); setExporting(null); return; }
      const csv = toCSV(data, columns);
      downloadCSV(`${label.toLowerCase()}-${new Date().toISOString().split("T")[0]}.csv`, csv);
    } catch (err) {
      alert("Export failed");
    }
    setExporting(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/settings" className="inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-accent h-8 w-8">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Data Export</h1>
          <p className="text-muted-foreground">Export your business data as CSV files</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {EXPORTS.map(exp => (
          <Card key={exp.key}>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><exp.icon className="h-4 w-4" /> {exp.label}</CardTitle></CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" onClick={() => handleExport(exp.key, exp.label, exp.columns)} disabled={exporting === exp.key}>
                {exporting === exp.key ? "Exporting..." : <><Download className="mr-2 h-4 w-4" /> Export CSV</>}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
