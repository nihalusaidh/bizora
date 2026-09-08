"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { ExportButton } from "@/components/export/export-button";
import { formatExpensesForCsv } from "@/lib/export";
import { getExpenses, deleteExpense, getExpenseSummary } from "@/server/actions/expenses";
import { getExpenseCategories } from "@/server/actions/expense-categories";
import { useBusiness } from "@/lib/store";
import {
  Search, Plus, Trash2, Edit, Tag, IndianRupee,
  Calendar, CreditCard, Repeat, ArrowLeft, BarChart3
} from "lucide-react";

interface Expense {
  id: string;
  description: string;
  amount: number;
  payment_method: string;
  vendor?: string | null;
  reference?: string | null;
  expense_date: string;
  notes?: string | null;
  is_recurring: boolean | null;
  recurring_period?: string | null;
  created_at: string;
  expense_categories?: { id: string; name: string; icon?: string | null; color?: string | null } | null;
}

interface Category {
  id: string;
  name: string;
  icon?: string | null;
}

interface CategorySummary {
  amount: number;
  color: string;
  icon: string;
  count: number;
}

export default function ExpensesPage() {
  const { businessId } = useBusiness();
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [summary, setSummary] = useState<{ total: number; byCategory: Record<string, CategorySummary>; count: number } | null>(null);

  const loadData = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const [expData, catData] = await Promise.all([
        getExpenses(businessId, {
          search,
          category_id: categoryFilter === "all" ? undefined : categoryFilter,
        }),
        getExpenseCategories(businessId),
      ]);
      setExpenses(expData);
      setCategories(catData);

      // Calculate summary for current month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];
      const summ = await getExpenseSummary(businessId, startOfMonth, endOfMonth);
      setSummary(summ);
    } catch (err) {
      console.error("Failed to load:", err);
    } finally {
      setLoading(false);
    }
  }, [businessId, search, categoryFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async (id: string) => {
    if (!businessId) return;
    if (!confirm("Delete this expense?")) return;
    try {
      await deleteExpense(businessId, id);
      loadData();
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/more")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Expenses</h1>
            <p className="text-muted-foreground">{expenses.length} expenses</p>
          </div>
        </div>
        <div className="flex gap-2">
          <ExportButton
            data={formatExpensesForCsv(expenses as unknown as Record<string, unknown>[])}
            filename={`expenses-${new Date().toISOString().split("T")[0]}`}
          />
          <Button variant="outline" size="sm" onClick={() => router.push("/expenses/categories")}>
            <Tag className="mr-1 h-4 w-4" />
            Categories
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Monthly Summary */}
      {summary && (
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">This Month — {summary.count} expenses</span>
          </div>
          <div className="text-3xl font-bold text-destructive mb-3">₹{summary.total.toLocaleString()}</div>
          {Object.keys(summary.byCategory).length > 0 && (
            <div className="flex flex-wrap gap-3">
              {Object.entries(summary.byCategory)
                .sort(([, a], [, b]) => b.amount - a.amount)
                .slice(0, 5)
                .map(([name, data]) => (
                  <div key={name} className="flex items-center gap-1.5 text-sm">
                    <span>{data.icon}</span>
                    <span className="text-muted-foreground">{name}:</span>
                    <span className="font-medium">₹{data.amount.toLocaleString()}</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search expenses..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v ?? "all")}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Expense List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : expenses.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center">
          <IndianRupee className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {search || categoryFilter !== "all" ? "No expenses found" : "No expenses yet"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {search || categoryFilter !== "all" ? "Try different filters" : "Track your business expenses"}
          </p>
          {!search && categoryFilter === "all" && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add First Expense
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {expenses.map((expense) => (
            <div key={expense.id} className="rounded-xl border bg-card p-4">
              <div className="flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center text-lg"
                  style={{ backgroundColor: expense.expense_categories?.color + "20" || "#6b728020" }}
                >
                  {expense.expense_categories?.icon || "📋"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{expense.description}</div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(expense.expense_date).toLocaleDateString()}
                    {expense.vendor && (
                      <>
                        <span>•</span>
                        <span>{expense.vendor}</span>
                      </>
                    )}
                    {expense.is_recurring && (
                      <Badge variant="secondary" className="text-xs">
                        <Repeat className="h-3 w-3 mr-0.5" />
                        {expense.recurring_period}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-destructive">-₹{expense.amount.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground capitalize">
                    {expense.payment_method?.replace("_", " ")}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setEditingExpense(expense)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => handleDelete(expense.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Expense</DialogTitle>
          </DialogHeader>
          <ExpenseForm
            businessId={businessId}
            categories={categories}
            onSuccess={() => {
              loadData();
              setShowForm(false);
            }}
            onCancel={() => setShowForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Form Dialog */}
      <Dialog open={!!editingExpense} onOpenChange={() => setEditingExpense(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
          </DialogHeader>
          {editingExpense && (
            <ExpenseForm
              businessId={businessId}
              categories={categories}
              expense={{
                ...editingExpense,
                expense_date: editingExpense.expense_date,
              }}
              onSuccess={() => {
                loadData();
                setEditingExpense(null);
              }}
              onCancel={() => setEditingExpense(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
