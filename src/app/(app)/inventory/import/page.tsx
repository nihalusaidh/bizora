"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBusiness } from "@/lib/store";
import { parseCSV, downloadCSV } from "@/lib/csv-utils";
import { createProduct } from "@/server/actions/products";
import { ArrowLeft, Upload, CheckCircle, AlertTriangle, Loader2, Download } from "lucide-react";

// Header aliases so Vyapar / Tally / Excel exports import without editing.
// Vyapar: "Item Name, Sale Price, Purchase Price, Opening Stock, GST Tax Rate %, HSN, Item Code"
// Tally: "Stock Item, Rate, Opening Qty, GST %, HSN/SAC"
const ALIASES: Record<string, string[]> = {
  name: ["name", "product_name", "item name", "item_name", "stock item", "stock_item", "particulars", "item"],
  sku: ["sku", "item code", "item_code", "itemcode", "code", "product code"],
  barcode: ["barcode", "bar code", "ean", "upc"],
  cost: ["cost_price", "cost", "purchase price", "purchase_price", "purchase rate", "buying price"],
  selling: ["selling_price", "selling", "price", "sale price", "sale_price", "selling rate", "mrp", "rate"],
  gst: ["gst_rate", "gst", "gst tax rate", "gst tax rate %", "tax rate", "tax%"],
  hsn: ["hsn_sac", "hsn", "hsn/sac", "hsn code"],
  stock: ["stock_quantity", "stock", "opening stock", "opening_stock", "opening qty", "quantity", "qty", "on hand"],
};

function pick(row: Record<string, string>, key: keyof typeof ALIASES): string {
  const lowered: Record<string, string> = {};
  for (const [k, v] of Object.entries(row)) lowered[k.trim().toLowerCase()] = v;
  for (const alias of ALIASES[key]) {
    if (lowered[alias] !== undefined && lowered[alias] !== "") return lowered[alias];
  }
  return "";
}

function detectSource(rows: Record<string, string>[]): string | null {
  const headers = Object.keys(rows[0] || {}).map((h) => h.trim().toLowerCase());
  if (headers.includes("item name") || headers.includes("sale price")) return "Vyapar";
  if (headers.includes("stock item")) return "Tally";
  return null;
}

export default function ImportProductsPage() {
  const router = useRouter();
  const { businessId } = useBusiness();
  const [data, setData] = useState<Record<string, string>[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const source = data.length ? detectSource(data) : null;

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
        const name = pick(row, "name");
        const cost = parseFloat(pick(row, "cost") || "0");
        const selling = parseFloat(pick(row, "selling") || "0");
        const stock = parseInt(pick(row, "stock") || "0", 10);

        if (!name) { errs.push(`Row ${count + 1}: Missing name`); continue; }

        await createProduct(businessId, {
          name,
          sku: pick(row, "sku") || null,
          barcode: pick(row, "barcode") || null,
          cost_price: cost,
          selling_price: selling || cost * 1.3,
          stock_quantity: Number.isNaN(stock) ? 0 : stock,
          category_id: null,
          gst_rate: parseFloat(pick(row, "gst") || "0"),
          hsn_sac: pick(row, "hsn") || null,
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
            <p className="text-xs text-muted-foreground mt-1">Works with Bizora, Vyapar & Tally exports — headers auto-mapped. Required: name. Optional: sku, barcode, prices, stock, gst, hsn</p>
          </div>
          <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} className="hidden" />

          {data.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {data.length} products found
                  {source && (
                    <span className="ml-2 rounded-full bg-[#DC2626]/10 px-2 py-0.5 text-[11px] font-bold text-[#DC2626]">
                      {source} format detected
                    </span>
                  )}
                </span>
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
