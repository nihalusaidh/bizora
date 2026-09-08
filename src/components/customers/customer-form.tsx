"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createCustomer, updateCustomer } from "@/server/actions/customers";
import { Loader2, ArrowLeft } from "lucide-react";

interface CustomerFormProps {
  businessId: string | null;
  customer?: {
    id: string;
    name: string;
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    gst_number?: string | null;
    notes?: string | null;
    preferred_delivery?: string | null;
  };
  onCancel?: () => void;
}

export function CustomerForm({ businessId, customer, onCancel }: CustomerFormProps) {
  const router = useRouter();
  const [name, setName] = useState(customer?.name || "");
  const [phone, setPhone] = useState(customer?.phone || "");
  const [email, setEmail] = useState(customer?.email || "");
  const [address, setAddress] = useState(customer?.address || "");
  const [gstNumber, setGstNumber] = useState(customer?.gst_number || "");
  const [notes, setNotes] = useState(customer?.notes || "");
  const [preferredDelivery, setPreferredDelivery] = useState(customer?.preferred_delivery || "ask");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!businessId) return;
    try {
      const data = {
        name,
        phone: phone || null,
        email: email || null,
        address: address || null,
        gst_number: gstNumber || null,
        notes: notes || null,
        preferred_delivery: preferredDelivery as "whatsapp" | "print" | "both" | "ask",
        is_active: true,
      };

      if (customer) {
        await updateCustomer(businessId, customer.id, data);
      } else {
        await createCustomer(businessId, data);
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
        <CardTitle>{customer ? "Edit Customer" : "New Customer"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Customer Name</Label>
            <Input
              id="name"
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="customer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              placeholder="Full address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gstNumber">GST Number</Label>
              <Input
                id="gstNumber"
                placeholder="22AAAAA0000A1Z5"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                maxLength={15}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="preferredDelivery">Invoice Delivery</Label>
              <Select value={preferredDelivery} onValueChange={(v) => setPreferredDelivery(v ?? "ask")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ask">Ask each time</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="print">Print</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              placeholder="Any notes about this customer"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
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
              ) : customer ? (
                "Update Customer"
              ) : (
                "Create Customer"
              )}
            </Button>
          </div>
        </CardContent>
      </form>
    </Card>
  );
}
