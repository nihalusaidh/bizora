"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { SupplierForm } from "@/components/inventory/supplier-form";
import { ArrowLeft, Plus, Edit, Trash2, Phone, Mail } from "lucide-react";

interface Supplier {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  balance?: number;
}

export default function SuppliersPage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

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
        .from("suppliers")
        .select("*")
        .eq("business_id", bid)
        .eq("is_active", true)
        .order("name");

      setSuppliers(data || []);
      setLoading(false);
    };
    fetchData();
  });

  const filtered = suppliers.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.phone?.includes(search) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (supplierId: string) => {
    if (!businessId) return;
    const supabase = createClient();
    await supabase
      .from("suppliers")
      .update({ is_active: false })
      .eq("id", supplierId);

    setSuppliers(suppliers.filter((s) => s.id !== supplierId));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/inventory" className="inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground h-8 w-8">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Suppliers</h1>
            <p className="text-muted-foreground">Manage your suppliers</p>
          </div>
        </div>
        <Button onClick={() => { setEditSupplier(null); setShowForm(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Supplier
        </Button>
      </div>

      <div className="relative">
        <Input
          placeholder="Search suppliers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {showForm && businessId && (
        <SupplierForm
          businessId={businessId}
          supplier={editSupplier || undefined}
          onCancel={() => { setShowForm(false); setEditSupplier(null); }}
        />
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <div className="text-5xl mb-4">🏭</div>
          <h3 className="text-lg font-semibold mb-2">
            {search ? "No suppliers found" : "No suppliers yet"}
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            {search
              ? "Try a different search term"
              : "Add your first supplier to track purchases and payments."}
          </p>
          {!search && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add First Supplier
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((supplier) => (
            <Card key={supplier.id}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold text-sm">
                    {supplier.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{supplier.name}</h3>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    {supplier.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {supplier.phone}
                      </span>
                    )}
                    {supplier.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {supplier.email}
                      </span>
                    )}
                  </div>
                </div>
                {supplier.balance !== undefined && supplier.balance !== 0 && (
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Balance</p>
                    <p className="font-medium">₹{supplier.balance}</p>
                  </div>
                )}
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => { setEditSupplier(supplier); setShowForm(true); }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(supplier.id)}
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
