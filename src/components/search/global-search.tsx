"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useBusiness } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search, Receipt, Package, Users, Building2, BarChart3, Bot, X, Command
} from "lucide-react";

interface SearchResult {
  type: "product" | "customer" | "invoice" | "supplier";
  id: string;
  title: string;
  subtitle: string;
  href: string;
  icon: React.ReactNode;
}

const iconMap = {
  product: <Package className="h-4 w-4" />,
  customer: <Users className="h-4 w-4" />,
  invoice: <Receipt className="h-4 w-4" />,
  supplier: <Building2 className="h-4 w-4" />,
};

export function GlobalSearch() {
  const router = useRouter();
  const { businessId } = useBusiness();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const search = useCallback(async (q: string) => {
    if (!businessId || q.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const items: SearchResult[] = [];

    // Search products
    const { data: products } = await supabase
      .from("products")
      .select("id, name, sku, selling_price")
      .eq("business_id", businessId)
      .or(`name.ilike.%${q}%,sku.ilike.%${q}%`)
      .limit(3);

    products?.forEach((p) => {
      items.push({
        type: "product",
        id: p.id,
        title: p.name,
        subtitle: `₹${p.selling_price} • SKU: ${p.sku || "N/A"}`,
        href: `/inventory/${p.id}`,
        icon: iconMap.product,
      });
    });

    // Search customers
    const { data: customers } = await supabase
      .from("customers")
      .select("id, name, phone")
      .eq("business_id", businessId)
      .or(`name.ilike.%${q}%,phone.ilike.%${q}%`)
      .limit(3);

    customers?.forEach((c) => {
      items.push({
        type: "customer",
        id: c.id,
        title: c.name,
        subtitle: c.phone || "No phone",
        href: `/customers/${c.id}`,
        icon: iconMap.customer,
      });
    });

    // Search invoices
    const { data: invoices } = await supabase
      .from("invoices")
      .select("id, invoice_number, total, status")
      .eq("business_id", businessId)
      .ilike("invoice_number", `%${q}%`)
      .limit(3);

    invoices?.forEach((i) => {
      items.push({
        type: "invoice",
        id: i.id,
        title: i.invoice_number,
        subtitle: `₹${i.total} • ${i.status}`,
        href: `/billing/invoices/${i.id}`,
        icon: iconMap.invoice,
      });
    });

    // Search suppliers
    const { data: suppliers } = await supabase
      .from("suppliers")
      .select("id, name, phone")
      .eq("business_id", businessId)
      .or(`name.ilike.%${q}%,phone.ilike.%${q}%`)
      .limit(2);

    suppliers?.forEach((s) => {
      items.push({
        type: "supplier",
        id: s.id,
        title: s.name,
        subtitle: s.phone || "No phone",
        href: `/suppliers`,
        icon: iconMap.supplier,
      });
    });

    setResults(items);
    setLoading(false);
  }, [businessId]);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  const quickActions = [
    { label: "Create Bill", href: "/billing", icon: <Receipt className="h-4 w-4" /> },
    { label: "Add Product", href: "/inventory/new", icon: <Package className="h-4 w-4" /> },
    { label: "Add Customer", href: "/customers", icon: <Users className="h-4 w-4" /> },
    { label: "Open Insights", href: "/insights", icon: <BarChart3 className="h-4 w-4" /> },
    { label: "Ask AI", href: "/ai", icon: <Bot className="h-4 w-4" /> },
  ];

  if (!open) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 text-muted-foreground"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="text-xs">Search</span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <Command className="h-2.5 w-2.5" />K
        </kbd>
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-background/80 backdrop-blur-sm animate-fade-in">
      <Card className="w-full max-w-lg mx-4 animate-scale-in overflow-hidden">
        <div className="flex items-center gap-3 border-b px-4">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            placeholder="Search products, customers, invoices..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-0 focus-visible:ring-0 h-12"
            autoFocus
          />
          <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => setOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <CardContent className="p-0 max-h-[50vh] overflow-y-auto">
          {query.length < 2 ? (
            <div className="p-3">
              <p className="text-xs font-medium text-muted-foreground px-2 mb-2">Quick actions</p>
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => { router.push(action.href); setOpen(false); }}
                  className="flex items-center gap-3 w-full px-2 py-2 rounded-lg text-sm hover:bg-muted transition-default"
                >
                  <span className="text-muted-foreground">{action.icon}</span>
                  {action.label}
                </button>
              ))}
            </div>
          ) : loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">Searching...</div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">No results found</div>
          ) : (
            <div className="p-2">
              {results.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => { router.push(result.href); setOpen(false); }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm hover:bg-muted transition-default"
                >
                  <span className="text-muted-foreground">{result.icon}</span>
                  <div className="flex-1 text-left min-w-0">
                    <div className="font-medium truncate">{result.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{result.subtitle}</div>
                  </div>
                  <span className="text-[10px] text-muted-foreground uppercase">{result.type}</span>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
