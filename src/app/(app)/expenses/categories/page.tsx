"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CategoryManager } from "@/components/expenses/category-manager";
import { getExpenseCategories } from "@/server/actions/expense-categories";
import { useBusiness } from "@/lib/store";
import { ArrowLeft } from "lucide-react";

export default function ExpenseCategoriesPage() {
  const { businessId } = useBusiness();
  const router = useRouter();
  const [categories, setCategories] = useState<Array<{ id: string; name: string; icon?: string | null; color?: string | null }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!businessId) return;
      try {
        const data = await getExpenseCategories(businessId);
        setCategories(data);
      } catch (err) {
        console.error("Failed to load:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [businessId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/expenses")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Expense Categories</h1>
          <p className="text-muted-foreground">Organize your expenses</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <CategoryManager categories={categories} />
      )}
    </div>
  );
}
