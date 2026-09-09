"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBusiness } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { Building2, Save, Check } from "lucide-react";

export default function InvoiceFooterSettings() {
  const { business, businessId } = useBusiness();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    terms_conditions: "",
    bank_name: "",
    bank_account: "",
    bank_ifsc: "",
    bank_upi: "",
  });

  useEffect(() => {
    if (business) {
      setForm({
        terms_conditions: (business as any).terms_conditions || "",
        bank_name: (business as any).bank_name || "",
        bank_account: (business as any).bank_account || "",
        bank_ifsc: (business as any).bank_ifsc || "",
        bank_upi: (business as any).bank_upi || "",
      });
    }
  }, [business]);

  const handleSave = async () => {
    if (!businessId) return;
    setLoading(true);
    setSaved(false);

    const supabase = createClient();
    await supabase
      .from("businesses")
      .update({
        terms_conditions: form.terms_conditions || null,
        bank_name: form.bank_name || null,
        bank_account: form.bank_account || null,
        bank_ifsc: form.bank_ifsc || null,
        bank_upi: form.bank_upi || null,
      })
      .eq("id", businessId);

    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Invoice Footer</h1>
        <p className="text-muted-foreground">
          Add bank details and terms to your invoices
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4" />
            Bank Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Bank Name</Label>
            <Input
              value={form.bank_name}
              onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
              placeholder="e.g. State Bank of India"
            />
          </div>
          <div className="space-y-2">
            <Label>Account Number</Label>
            <Input
              value={form.bank_account}
              onChange={(e) => setForm({ ...form, bank_account: e.target.value })}
              placeholder="Account number"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>IFSC Code</Label>
              <Input
                value={form.bank_ifsc}
                onChange={(e) => setForm({ ...form, bank_ifsc: e.target.value })}
                placeholder="e.g. SBIN0001234"
              />
            </div>
            <div className="space-y-2">
              <Label>UPI ID</Label>
              <Input
                value={form.bank_upi}
                onChange={(e) => setForm({ ...form, bank_upi: e.target.value })}
                placeholder="e.g. business@upi"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Terms & Conditions</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            value={form.terms_conditions}
            onChange={(e) => setForm({ ...form, terms_conditions: e.target.value })}
            placeholder="e.g. Payment due within 30 days. Goods once sold will not be returned."
            className="w-full min-h-[100px] rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={loading} className="gap-2">
        {saved ? (
          <>
            <Check className="h-4 w-4" />
            Saved!
          </>
        ) : loading ? (
          "Saving..."
        ) : (
          <>
            <Save className="h-4 w-4" />
            Save Changes
          </>
        )}
      </Button>
    </div>
  );
}
