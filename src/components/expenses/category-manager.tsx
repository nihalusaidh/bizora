"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createExpenseCategory,
  updateExpenseCategory,
  deleteExpenseCategory,
  seedDefaultCategories,
} from "@/server/actions/expense-categories";
import { useBusiness } from "@/lib/store";
import { Loader2, Plus, Edit, Trash2, Tag } from "lucide-react";

interface Category {
  id: string;
  name: string;
  icon?: string | null;
  color?: string | null;
}

const ICON_OPTIONS = ["🏠", "💡", "👤", "📦", "📢", "🚚", "📎", "🔧", "🛡️", "📋", "💰", "🎯", "🛒", "📱", "🍽️"];

export function CategoryManager({ categories: initialCategories }: { categories: Category[] }) {
  const { businessId } = useBusiness();
  const [categories, setCategories] = useState(initialCategories);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("📋");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
    setName("");
    setIcon("📋");
    setEditing(null);
    setShowForm(false);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId || !name.trim()) return;
    setLoading(true);
    setError("");

    try {
      if (editing) {
        await updateExpenseCategory(businessId, editing.id, { name, icon });
      } else {
        await createExpenseCategory(businessId, { name, icon });
      }
      resetForm();
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!businessId) return;
    if (!confirm("Delete this category?")) return;
    try {
      await deleteExpenseCategory(businessId, id);
      setCategories(categories.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  const handleSeedDefaults = async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      await seedDefaultCategories(businessId);
      window.location.reload();
    } catch (err) {
      console.error("Failed to seed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Categories ({categories.length})</h3>
        <div className="flex gap-2">
          {categories.length === 0 && (
            <Button variant="outline" size="sm" onClick={handleSeedDefaults} disabled={loading}>
              Load Defaults
            </Button>
          )}
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus className="mr-1 h-4 w-4" />
            Add
          </Button>
        </div>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{editing ? "Edit Category" : "New Category"}</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-3">
              {error && <div className="p-2 text-sm text-destructive bg-destructive/10 rounded-md">{error}</div>}

              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  placeholder="Category name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Icon</Label>
                <div className="flex flex-wrap gap-2">
                  {ICON_OPTIONS.map((i) => (
                    <button
                      key={i}
                      type="button"
                      className={`h-9 w-9 rounded-lg border flex items-center justify-center text-lg transition-colors ${
                        icon === i ? "bg-primary/10 border-primary" : "hover:bg-muted"
                      }`}
                      onClick={() => setIcon(i)}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                  {editing ? "Update" : "Create"}
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      )}

      <div className="space-y-2">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex items-center justify-between rounded-lg border bg-card p-3"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{cat.icon || "📋"}</span>
              <span className="font-medium">{cat.name}</span>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  setEditing(cat);
                  setName(cat.name);
                  setIcon(cat.icon || "📋");
                  setShowForm(true);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={() => handleDelete(cat.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        {categories.length === 0 && !showForm && (
          <div className="text-center py-6 text-muted-foreground">
            <Tag className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No categories yet. Add your first category or load defaults.</p>
          </div>
        )}
      </div>
    </div>
  );
}
