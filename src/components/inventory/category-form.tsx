"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createCategory, updateCategory } from "@/server/actions/categories";
import { Loader2, ArrowLeft } from "lucide-react";

interface CategoryFormProps {
  businessId: string;
  category?: {
    id: string;
    name: string;
    icon?: string | null;
    color?: string | null;
    sort_order?: number;
  };
  onCancel?: () => void;
}

const ICON_OPTIONS = ["📦", "👕", "📱", "💄", "🍞", "🔧", "🪑", "🛒", "💊", "🎮", "📚", "🏠"];

export function CategoryForm({ businessId, category, onCancel }: CategoryFormProps) {
  const router = useRouter();
  const [name, setName] = useState(category?.name || "");
  const [icon, setIcon] = useState(category?.icon || "");
  const [color, setColor] = useState(category?.color || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (category) {
        await updateCategory(businessId, category.id, {
          name,
          icon: icon || null,
          color: color || null,
        });
      } else {
        await createCategory(businessId, {
          name,
          icon: icon || null,
          color: color || null,
          sort_order: 0,
        });
      }
      router.refresh();
      onCancel?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{category ? "Edit Category" : "New Category"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              placeholder="e.g. Electronics, Clothing"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Icon (optional)</Label>
            <div className="flex flex-wrap gap-2">
              {ICON_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(icon === emoji ? "" : emoji)}
                  className={`h-10 w-10 rounded-lg border text-xl flex items-center justify-center transition-all ${
                    icon === emoji
                      ? "border-primary bg-primary/10"
                      : "border-transparent bg-muted/30 hover:bg-muted"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            )}
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : category ? (
                "Update Category"
              ) : (
                "Create Category"
              )}
            </Button>
          </div>
        </CardContent>
      </form>
    </Card>
  );
}
