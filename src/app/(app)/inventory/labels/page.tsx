"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBusiness } from "@/lib/store";
import { BarcodeDisplay } from "@/components/inventory/barcode-display";
import { ArrowLeft, Search, Printer, Package, CheckSquare } from "lucide-react";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  sku?: string | null;
  barcode?: string | null;
  mrp?: number | null;
  selling_price: number;
  batch_number?: string | null;
}

type PaperSize = "4x2" | "3x2" | "2x1";

const PAPER_CONFIG: Record<PaperSize, { labelW: string; labelH: string; cols: number; name: string }> = {
  "4x2": { labelW: "100mm", labelH: "50mm", cols: 3, name: "100 x 50mm (A4 3x8)" },
  "3x2": { labelW: "75mm", labelH: "50mm", cols: 4, name: "75 x 50mm (A4 4x6)" },
  "2x1": { labelW: "50mm", labelH: "25mm", cols: 6, name: "50 x 25mm (A4 6x11)" },
};

export default function BarcodeLabelsPage() {
  const { businessId } = useBusiness();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [paperSize, setPaperSize] = useState<PaperSize>("4x2");
  const [showName, setShowName] = useState(true);
  const [showPrice, setShowPrice] = useState(true);
  const [showBarcode, setShowBarcode] = useState(true);
  const [showSku, setShowSku] = useState(false);
  const [showMrp, setShowMrp] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  const loadProducts = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const supabase = createClient();
      let query = supabase
        .from("products")
        .select("id, name, sku, barcode, mrp, selling_price, batch_number, is_active")
        .eq("business_id", businessId)
        .eq("is_active", true)
        .order("name");

      if (search) {
        query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%,barcode.ilike.%${search}%`);
      }

      const { data } = await query.limit(200);
      setProducts(data || []);
    } catch (err) {
      console.error("Failed to load:", err);
    } finally {
      setLoading(false);
    }
  }, [businessId, search]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const toggleProduct = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const selectAll = () => {
    if (selected.size === products.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(products.map((p) => p.id)));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const config = PAPER_CONFIG[paperSize];
  const selectedProducts = products.filter((p) => selected.has(p.id));

  return (
    <div className="space-y-6 print:hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/inventory" className="inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-accent h-8 w-8">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Barcode Labels</h1>
            <p className="text-muted-foreground">Print barcode labels for your products</p>
          </div>
        </div>
        <Button onClick={handlePrint} disabled={selected.size === 0}>
          <Printer className="mr-2 h-4 w-4" />
          Print {selected.size > 0 ? `(${selected.size})` : ""}
        </Button>
      </div>

      {/* Config */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[160px]">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Paper Size</label>
              <Select value={paperSize} onValueChange={(v) => setPaperSize(v as PaperSize)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PAPER_CONFIG).map(([key, cfg]) => (
                    <SelectItem key={key} value={key}>{cfg.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 items-end">
              {[
                { label: "Name", checked: showName, onChange: setShowName },
                { label: "Price", checked: showPrice, onChange: setShowPrice },
                { label: "Barcode", checked: showBarcode, onChange: setShowBarcode },
                { label: "SKU", checked: showSku, onChange: setShowSku },
                { label: "MRP", checked: showMrp, onChange: setShowMrp },
              ].map((opt) => (
                <label key={opt.label} className="flex items-center gap-1.5 text-sm cursor-pointer">
                  <Checkbox checked={opt.checked} onCheckedChange={(v: boolean | "indeterminate") => opt.onChange(v === true)} />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search & Select */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search products..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button variant="outline" onClick={selectAll}>
          <CheckSquare className="mr-2 h-4 w-4" />
          {selected.size === products.length ? "Deselect All" : "Select All"}
        </Button>
      </div>

      {/* Product List */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">{search ? "No products found" : "No products yet"}</h3>
          <p className="text-muted-foreground">Add products with barcodes to print labels</p>
        </div>
      ) : (
        <div className="space-y-2">
          {products.map((product) => (
            <label
              key={product.id}
              className="flex items-center gap-3 rounded-xl border bg-card p-3 hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <Checkbox checked={selected.has(product.id)} onCheckedChange={() => toggleProduct(product.id)} />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{product.name}</div>
                <div className="text-xs text-muted-foreground">
                  {product.sku && <span>SKU: {product.sku}</span>}
                  {product.barcode && <span className="ml-2">Barcode: {product.barcode}</span>}
                  {product.batch_number && <span className="ml-2">Batch: {product.batch_number}</span>}
                </div>
              </div>
              <div className="text-right text-sm">
                <div className="font-bold">₹{product.selling_price}</div>
                {product.mrp && <div className="text-xs text-muted-foreground">MRP: ₹{product.mrp}</div>}
              </div>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
