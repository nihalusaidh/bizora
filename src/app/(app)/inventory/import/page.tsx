"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useBusiness } from "@/lib/store";
import { parseCSV, downloadCSV } from "@/lib/csv-utils";
import { createProduct } from "@/server/actions/products";
import { ArrowLeft, Upload, FileText, CheckCircle, AlertTriangle, Loader2, Download } from "lucide-react";

export default function ImportProductsPage() {
  const router = useRouter();
  const { businessId } = useBusiness();
  const [data, setData] = useState<Record<string, string>[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseCSV(text);
      setData(parsed);
      setErrors([]);
      setImported(0);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!businessId || data.length === 0) return;
    setImporting(true);
    let count = 0;
    const errs: string[] = [];

    for (const row of data) {
      try {
        const name = row.name || row.Name || row.product_name || "";
        const cost = parseFloat(row.cost_price || row.cost || row.Cost || "0");
        const selling = parseFloat(row.selling_price || row.price || row.Price || row.selling || "0");

        if (!name) { errs.push(`Row ${count + 1}: Missing name`); continue; }

        await createProduct(businessId, {
          name,
          sku: row.sku || row.SKU || null,
          barcode: row.barcode || row.Barcode || null,
          cost_price: cost,
          selling_price: selling || cost * 1.3,
          category_id: null,
          gst_rate: parseFloat(row.gst_rate || row.GST || "0"),
          hsn_sac: row.hsn || row.HSN || null,
          min_stock: 0,
          has_variants: false,
          is_active: true,
        });
        count++;
      } catch (err) {
        errs.push(`Row ${count + 1}: ${err instanceof Error ? err.message : "Failed"}`);
      }
    }

    setImported(count);
    setErrors(errs);
    setImporting(false);
  };

  const handleExport = () => {
    if (!data.length) return;
    const csv = data.map(row => Object.values(row).join(",")).join("\n");
    const header = Object.keys(data[0]).join(",");
    downloadCSV(`products-export-${new Date().toISOString().split("T")[0]}.csv`, header + "\n" + csv);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/inventory" className="inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-accent h-8 w-8">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Import Products</h1>
          <p className="text-muted-foreground">Upload a CSV file to add products in bulk</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Upload CSV</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-dashed p-8 text-center cursor-pointer hover:border-primary/50" onClick={() => fileRef.current?.click()}>
            <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm">Click to select a CSV file</p>
            <p className="text-xs text-muted-foreground mt-1">Required column: name. Optional: sku, barcode, cost_price, selling_price, gst_rate, hsn</p>
          </div>
          <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} className="hidden" />

          {data.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{data.length} products found</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleExport}><Download className="mr-2 h-4 w-4" /> Export Template</Button>
                  <Button size="sm" onClick={handleImport} disabled={importing}>
                    {importing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                    Import {data.length} Products
                  </Button>
                </div>
              </div>
              <div className="max-h-64 overflow-auto rounded-lg border">
                <table className="w-full text-sm">
                  <thead className="bg-muted sticky top-0">
                    <tr>{Object.keys(data[0] || {}).map(h => <th key={h} className="px-3 py-2 text-left font-medium">{h}</th>)}</tr>
                  </thead>
                  <tbody>{data.slice(0, 10).map((row, i) => (
                    <tr key={i} className="border-t">{Object.values(row).map((v, j) => <td key={j} className="px-3 py-2">{v}</td>)}</tr>
                  ))}</tbody>
                </table>
                {data.length > 10 && <p className="text-xs text-muted-foreground text-center py-2">...and {data.length - 10} more</p>}
              </div>
            </div>
          )}

          {imported > 0 && (
            <div className="rounded-lg bg-green-500/10 p-4 text-sm">
              <CheckCircle className="h-4 w-4 text-green-500 inline mr-2" />
              {imported} products imported successfully
            </div>
          )}

          {errors.length > 0 && (
            <div className="rounded-lg bg-[#DC2626]/10 p-4 text-sm max-h-48 overflow-auto">
              <AlertTriangle className="h-4 w-4 text-[#DC2626] inline mr-2" />
              {errors.length} errors:
              <ul className="mt-2 space-y-1">{errors.map((e, i) => <li key={i} className="text-xs">{e}</li>)}</ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
