"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/store";
import { Database, ShoppingCart, Package, Users, BarChart3, Sparkles } from "lucide-react";

const demoBusiness = {
  id: "demo-business-001",
  name: "Sharma Electronics",
  industry: "Electronics Retail",
  business_type: "retail",
  monthly_revenue: 450000,
  address: "42 MG Road, Jaipur, Rajasthan",
  phone: "+919876543210",
  email: "demo@sharmaelectronics.com",
  gst_status: "registered",
  gstin: "08AABCS1234A1Z5",
  created_at: new Date().toISOString(),
};

const demoProducts = [
  { id: "p1", name: "Samsung Galaxy S24", sku: "SAM-S24", selling_price: 74999, cost_price: 62000, stock_quantity: 15, min_stock: 5, category: { name: "Smartphones" } },
  { id: "p2", name: "iPhone 15", sku: "APL-15", selling_price: 79900, cost_price: 68000, stock_quantity: 8, min_stock: 3, category: { name: "Smartphones" } },
  { id: "p3", name: "OnePlus 12", sku: "OP-12", selling_price: 64999, cost_price: 54000, stock_quantity: 12, min_stock: 4, category: { name: "Smartphones" } },
  { id: "p4", name: "Sony WH-1000XM5", sku: "SNY-XM5", selling_price: 29990, cost_price: 22000, stock_quantity: 20, min_stock: 5, category: { name: "Audio" } },
  { id: "p5", name: "boAt Rockerz 450", sku: "BOAT-450", selling_price: 1799, cost_price: 800, stock_quantity: 45, min_stock: 10, category: { name: "Audio" } },
  { id: "p6", name: "Mi Smart TV 43\"", sku: "MI-TV43", selling_price: 24999, cost_price: 19000, stock_quantity: 3, min_stock: 2, category: { name: "TVs" } },
  { id: "p7", name: "Noise ColorFit Pro 5", sku: "NSE-CF5", cost_price: 2500, selling_price: 4999, stock_quantity: 30, min_stock: 8, category: { name: "Wearables" } },
  { id: "p8", name: "Apple AirPods Pro 2", sku: "APL-APP2", selling_price: 24900, cost_price: 18500, stock_quantity: 2, min_stock: 3, category: { name: "Audio" } },
];

const demoCustomers = [
  { id: "c1", name: "Rahul Sharma", phone: "+919812345678", email: "rahul@email.com", outstanding_balance: 2400, total_spend: 42850, purchase_count: 8 },
  { id: "c2", name: "Priya Patel", phone: "+919876543211", email: "priya@email.com", outstanding_balance: 0, total_spend: 18500, purchase_count: 4 },
  { id: "c3", name: "Amit Kumar", phone: "+919898765432", outstanding_balance: 5200, total_spend: 67200, purchase_count: 12 },
  { id: "c4", name: "Neha Gupta", phone: "+919845678901", outstanding_balance: 0, total_spend: 8900, purchase_count: 2 },
  { id: "c5", name: "Vikram Singh", phone: "+919867890123", outstanding_balance: 1800, total_spend: 31500, purchase_count: 6 },
];

export function DemoMode() {
  const router = useRouter();
  const { setBusiness, setPlan } = useAppStore();
  const [loading, setLoading] = useState(false);

  const startDemo = async () => {
    setLoading(true);

    // Set demo business in store
    setBusiness(demoBusiness as never);
    setPlan("pro");

    // Store demo flag
    localStorage.setItem("bizora-demo", "true");
    localStorage.setItem("bizora-demo-data", JSON.stringify({
      products: demoProducts,
      customers: demoCustomers,
    }));

    router.push("/dashboard");
  };

  return (
    <Card className="border-dashed border-primary/30 bg-primary/5">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold">Explore with demo data</h3>
              <Badge variant="secondary" className="text-[10px]">DEMO</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              See how Bizora works with a sample electronics shop. Includes products, customers, and sample transactions.
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
              <span className="flex items-center gap-1"><Package className="h-3 w-3" /> 8 products</span>
              <span className="flex items-center gap-1"><Users className="h-3 w-3" /> 5 customers</span>
              <span className="flex items-center gap-1"><BarChart3 className="h-3 w-3" /> Sample insights</span>
            </div>
            <Button onClick={startDemo} disabled={loading} size="sm">
              <Database className="mr-2 h-3.5 w-3.5" />
              {loading ? "Loading..." : "Start demo"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
