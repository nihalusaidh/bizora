"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ProductForm } from "@/components/inventory/product-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [suppliers, setSuppliers] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);

  // Fetch categories and suppliers on mount
  useState(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: memberships } = await supabase
        .from("memberships")
        .select("business_id")
        .eq("user_id", user.id)
        .limit(1);

      if (!memberships?.[0]) return;

      const businessId = memberships[0].business_id;

      const [cats, sups] = await Promise.all([
        supabase.from("categories").select("id, name").eq("business_id", businessId).eq("is_active", true).order("name"),
        supabase.from("suppliers").select("id, name").eq("business_id", businessId).eq("is_active", true).order("name"),
      ]);

      setCategories(cats.data || []);
      setSuppliers(sups.data || []);
      setLoading(false);
    };
    fetchData();
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
          <Link href="/inventory" className="inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground h-8 w-8">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Product</h1>
          <p className="text-muted-foreground">Add a new product to your inventory</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
        </div>
      ) : (
        <NewProductFormWrapper categories={categories} suppliers={suppliers} />
      )}
    </div>
  );
}

function NewProductFormWrapper({
  categories,
  suppliers,
}: {
  categories: Array<{ id: string; name: string }>;
  suppliers: Array<{ id: string; name: string }>;
}) {
  const router = useRouter();
  const [businessId, setBusinessId] = useState<string | null>(null);

  useState(() => {
    const getBusinessId = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: memberships } = await supabase
        .from("memberships")
        .select("business_id")
        .eq("user_id", user.id)
        .limit(1);

      if (memberships?.[0]) {
        setBusinessId(memberships[0].business_id);
      }
    };
    getBusinessId();
  });

  if (!businessId) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
      </div>
    );
  }

  return (
    <ProductForm
      businessId={businessId}
      categories={categories}
      suppliers={suppliers}
      onCancel={() => router.push("/inventory")}
    />
  );
}
