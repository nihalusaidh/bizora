"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryForm } from "@/components/inventory/category-form";
import { ArrowLeft, Plus, Edit, Trash2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  icon?: string | null;
  product_count?: number;
}

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [businessId, setBusinessId] = useState<string | null>(null);

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
      const bid = memberships[0].business_id;
      setBusinessId(bid);

      const { data } = await supabase
        .from("categories")
        .select("*")
        .eq("business_id", bid)
        .eq("is_active", true)
        .order("name");

      setCategories(data || []);
      setLoading(false);
    };
    fetchData();
  });

  const handleDelete = async (categoryId: string) => {
    if (!businessId) return;
    const supabase = createClient();
    await supabase
      .from("categories")
      .update({ is_active: false })
      .eq("id", categoryId);

    setCategories(categories.filter((c) => c.id !== categoryId));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/inventory" className="inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground h-8 w-8">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
            <p className="text-muted-foreground">Organize your products</p>
          </div>
        </div>
        <Button onClick={() => { setEditCategory(null); setShowForm(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {showForm && businessId && (
        <CategoryForm
          businessId={businessId}
          category={editCategory || undefined}
          onCancel={() => { setShowForm(false); setEditCategory(null); }}
        />
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
        </div>
      ) : categories.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <div className="text-5xl mb-4">🏷️</div>
          <h3 className="text-lg font-semibold mb-2">No categories yet</h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            Create categories to organize your products.
          </p>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create First Category
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Card key={cat.id}>
              <CardContent className="flex items-center gap-4 p-4">
                <span className="text-2xl">{cat.icon || "📦"}</span>
                <div className="flex-1">
                  <h3 className="font-medium">{cat.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {cat.product_count || 0} products
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => { setEditCategory(cat); setShowForm(true); }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(cat.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
