"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createExpense, updateExpense } from "@/server/actions/expenses";
import { Loader2 } from "lucide-react";

interface ExpenseFormProps {
  businessId: string | null;
  categories: Array<{ id: string; name: string; icon?: string | null }>;
  expense?: {
    id: string;
    description: string;
    amount: number;
    category_id?: string | null;
    payment_method?: string | null;
    vendor?: string | null;
    reference?: string | null;
    expense_date: string;
    notes?: string | null;
    is_recurring?: boolean | null;
    recurring_period?: string | null;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ExpenseForm({ businessId, categories, expense, onSuccess, onCancel }: ExpenseFormProps) {
  const [description, setDescription] = useState(expense?.description || "");
  const [amount, setAmount] = useState(expense?.amount?.toString() || "");
  const [categoryId, setCategoryId] = useState(expense?.category_id || "");
  const [paymentMethod, setPaymentMethod] = useState(expense?.payment_method || "cash");
  const [vendor, setVendor] = useState(expense?.vendor || "");
  const [reference, setReference] = useState(expense?.reference || "");
  const [expenseDate, setExpenseDate] = useState(expense?.expense_date || new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState(expense?.notes || "");
  const [isRecurring, setIsRecurring] = useState(expense?.is_recurring || false);
  const [recurringPeriod, setRecurringPeriod] = useState(expense?.recurring_period || "monthly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) return;
    setLoading(true);
    setError("");

    try {
      const data = {
        description,
        amount: parseFloat(amount),
        category_id: categoryId || null,
        payment_method: paymentMethod as "cash" | "upi" | "card" | "bank_transfer" | "other",
        vendor: vendor || null,
        reference: reference || null,
        expense_date: expenseDate,
        notes: notes || null,
        is_recurring: isRecurring,
        recurring_period: isRecurring ? recurringPeriod as "daily" | "weekly" | "monthly" | "yearly" : null,
      };

      if (expense) {
        await updateExpense(businessId, expense.id, data);
      } else {
        await createExpense(businessId, data);
      }
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{expense ? "Edit Expense" : "New Expense"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">{error}</div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="e.g. Office rent for September"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0.01"
                step="0.01"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={categoryId} onValueChange={(v) => setCategoryId(v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v ?? "cash")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vendor">Vendor (optional)</Label>
              <Input
                id="vendor"
                placeholder="e.g. ABC Suppliers"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reference">Reference (optional)</Label>
              <Input
                id="reference"
                placeholder="Transaction ID, invoice #"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Input
              id="notes"
              placeholder="Additional notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="recurring"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="recurring" className="text-sm">Recurring expense</Label>
          </div>

          {isRecurring && (
            <div className="space-y-2">
              <Label>Recurring Period</Label>
              <Select value={recurringPeriod} onValueChange={(v) => setRecurringPeriod(v ?? "monthly")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex gap-3">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
            )}
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : expense ? (
                "Update Expense"
              ) : (
                "Add Expense"
              )}
            </Button>
          </div>
        </CardContent>
      </form>
    </Card>
  );
}
