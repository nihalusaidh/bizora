"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useBusiness } from "@/lib/store";
import { BizoraChart } from "@/components/charts/bizora-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/shared";
import {
  Package,
  DollarSign,
  AlertTriangle,
  XOctagon,
  TrendingUp,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  selling_price: number;
  cost_price: number;
  stock_quantity: number;
  min_stock: number | null;
  category_id: string | null;
  is_active: boolean;
}

interface InvoiceItemRow {
  quantity: number;
  total: number;
  product_id: string | null;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
}

interface CategoryValue {
  name: string;
  value: number;
}

interface VelocityPoint {
  name: string;
  revenue: number;
  quantity: number;
}

interface TopProduct {
  name: string;
  revenue: number;
  quantity: number;
}

interface LowStockProduct {
  name: string;
  stock: number;
  minStock: number;
}

interface InventoryData {
  totalProducts: number;
  stockValue: number;
  lowStock: number;
  outOfStock: number;
  categoryData: CategoryValue[];
  velocityData: VelocityPoint[];
  topProducts: TopProduct[];
  lowStockAlerts: LowStockProduct[];
}

function buildCategoryMap(categories: Category[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const c of categories) map[c.id] = c.name;
  return map;
}

function computeLast30Days(items: InvoiceItemRow[]): VelocityPoint[] {
  const now = new Date();
  const days: VelocityPoint[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    const label = `${d.getMonth() + 1}/${d.getDate()}`;
    const dayItems = items.filter((it) => it.created_at.startsWith(key));
    days.push({
      name: label,
      revenue: dayItems.reduce((s, it) => s + Number(it.total), 0),
      quantity: dayItems.reduce((s, it) => s + it.quantity, 0),
    });
  }
  return days;
}

export default function InventoryInsightsPage() {
  const { businessId } = useBusiness();
  const [data, setData] = useState<InventoryData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);

    const supabase = createClient();

    const [productsRes, itemsRes, categoriesRes] = await Promise.all([
      supabase
        .from("products")
        .select("id, name, selling_price, cost_price, stock_quantity, min_stock, category_id, is_active")
        .eq("business_id", businessId)
        .eq("is_active", true),
      supabase
        .from("invoice_items")
        .select("quantity, total, product_id, created_at")
        .eq("business_id", businessId),
      supabase
        .from("categories")
        .select("id, name")
        .eq("business_id", businessId),
    ]);

    const products = (productsRes.data ?? []) as Product[];
    const items = (itemsRes.data ?? []) as InvoiceItemRow[];
    const categories = (categoriesRes.data ?? []) as Category[];
    const catMap = buildCategoryMap(categories);

    const totalProducts = products.length;
    const stockValue = products.reduce(
      (s, p) => s + p.stock_quantity * Number(p.selling_price),
      0
    );
    const lowStock = products.filter(
      (p) => p.stock_quantity > 0 && p.stock_quantity <= (p.min_stock ?? 5)
    ).length;
    const outOfStock = products.filter((p) => p.stock_quantity <= 0).length;

    const categoryAgg: Record<string, number> = {};
    for (const p of products) {
      const catName = (p.category_id && catMap[p.category_id]) || "Uncategorized";
      categoryAgg[catName] =
        (categoryAgg[catName] ?? 0) + p.stock_quantity * Number(p.selling_price);
    }
    const categoryData: CategoryValue[] = Object.entries(categoryAgg)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const velocityData = computeLast30Days(items);

    const productRevenue: Record<string, TopProduct> = {};
    for (const it of items) {
      if (!it.product_id) continue;
      const existing = productRevenue[it.product_id];
      if (existing) {
        existing.revenue += Number(it.total);
        existing.quantity += it.quantity;
      } else {
        const prod = products.find((p) => p.id === it.product_id);
        productRevenue[it.product_id] = {
          name: prod?.name ?? "Unknown",
          revenue: Number(it.total),
          quantity: it.quantity,
        };
      }
    }
    const topProducts = Object.values(productRevenue)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    const lowStockAlerts: LowStockProduct[] = products
      .filter((p) => p.stock_quantity <= (p.min_stock ?? 5))
      .sort((a, b) => a.stock_quantity - b.stock_quantity)
      .slice(0, 10)
      .map((p) => ({
        name: p.name,
        stock: p.stock_quantity,
        minStock: p.min_stock ?? 5,
      }));

    setData({
      totalProducts,
      stockValue,
      lowStock,
      outOfStock,
      categoryData,
      velocityData,
      topProducts,
      lowStockAlerts,
    });
    setLoading(false);
  }, [businessId]);

  useEffect(() => {
    load();
  }, [load]);

  const formatCurrency = useMemo(
    () => (v: number) => `₹${v.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`,
    []
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-7 w-56 mb-1" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-80 rounded-xl bg-muted animate-pulse" />
          <div className="h-80 rounded-xl bg-muted animate-pulse" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const hasAnyData =
    data.totalProducts > 0 ||
    data.categoryData.length > 0 ||
    data.topProducts.length > 0;

  if (!hasAnyData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory Intelligence</h1>
          <p className="text-muted-foreground">
            Stock health, movement and opportunities
          </p>
        </div>
        <EmptyState
          icon={<Package className="h-12 w-12" />}
          title="No inventory data yet"
          description="Add products and start billing to see inventory insights and stock analytics."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Inventory Intelligence</h1>
        <p className="text-muted-foreground">
          Stock health, movement and opportunities
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Total Products"
          value={data.totalProducts.toLocaleString()}
          icon={<Package className="h-4 w-4" />}
        />
        <MetricCard
          label="Stock Value"
          value={formatCurrency(data.stockValue)}
          icon={<DollarSign className="h-4 w-4" />}
        />
        <MetricCard
          label="Low Stock"
          value={String(data.lowStock)}
          icon={<AlertTriangle className="h-4 w-4" />}
          variant={data.lowStock > 0 ? "warning" : "default"}
        />
        <MetricCard
          label="Out of Stock"
          value={String(data.outOfStock)}
          icon={<XOctagon className="h-4 w-4" />}
          variant={data.outOfStock > 0 ? "danger" : "default"}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {data.categoryData.length > 0 && (
          <BizoraChart
            type="bar"
            data={data.categoryData}
            dataKey="value"
            xAxisKey="name"
            title="Stock Value by Category"
            subtitle="Inventory value breakdown"
            formatValue={formatCurrency}
            height={280}
          />
        )}
        {data.velocityData.some((d) => d.revenue > 0) && (
          <BizoraChart
            type="line"
            data={data.velocityData}
            dataKey="revenue"
            xAxisKey="name"
            title="Sales Velocity"
            subtitle="Last 30 days revenue trend"
            formatValue={formatCurrency}
            color="#DC2626"
            height={280}
          />
        )}
      </div>

      {/* Top Products */}
      {data.topProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Top 10 Products by Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <th className="pb-3 pr-4">#</th>
                    <th className="pb-3 pr-4">Product</th>
                    <th className="pb-3 pr-4 text-right">Qty Sold</th>
                    <th className="pb-3 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topProducts.map((p, i) => (
                    <tr
                      key={i}
                      className="border-b border-border last:border-0"
                    >
                      <td className="py-3 pr-4 text-muted-foreground">{i + 1}</td>
                      <td className="py-3 pr-4 font-medium">{p.name}</td>
                      <td className="py-3 pr-4 text-right text-muted-foreground">
                        {p.quantity}
                      </td>
                      <td className="py-3 text-right font-semibold financial-number">
                        {formatCurrency(p.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Low Stock Alerts */}
      {data.lowStockAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-[#DC2626]" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <th className="pb-3 pr-4">Product</th>
                    <th className="pb-3 pr-4 text-right">In Stock</th>
                    <th className="pb-3 pr-4 text-right">Min Required</th>
                    <th className="pb-3 text-right">Deficit</th>
                  </tr>
                </thead>
                <tbody>
                  {data.lowStockAlerts.map((p, i) => (
                    <tr
                      key={i}
                      className="border-b border-border last:border-0"
                    >
                      <td className="py-3 pr-4 font-medium">{p.name}</td>
                      <td className="py-3 pr-4 text-right font-semibold text-[#DC2626]">
                        {p.stock}
                      </td>
                      <td className="py-3 pr-4 text-right text-muted-foreground">
                        {p.minStock}
                      </td>
                      <td className="py-3 text-right text-[#DC2626] font-medium">
                        {p.minStock - p.stock}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
  variant = "default",
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  variant?: "default" | "warning" | "danger";
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 transition-all hover:shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {label}
          </p>
          <p
            className={`mt-1.5 text-2xl font-bold tracking-tight financial-number ${
              variant === "danger"
                ? "text-[#DC2626]"
                : variant === "warning"
                ? "text-[#737373]"
                : "text-foreground"
            }`}
          >
            {value}
          </p>
        </div>
        <div className="rounded-lg bg-muted p-2 text-muted-foreground">{icon}</div>
      </div>
    </div>
  );
}
