"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CustomerForm } from "@/components/customers/customer-form";
import { ExportButton } from "@/components/export/export-button";
import { formatCustomersForCsv } from "@/lib/export";
import { getCustomers, deleteCustomer } from "@/server/actions/customers";
import { useBusiness } from "@/lib/store";
import {
  Search, Plus, Phone, Users, IndianRupee,
  MoreVertical, Edit, Trash2, UserCircle
} from "lucide-react";

interface Customer {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  outstanding_balance: number;
  total_spend: number;
  purchase_count: number;
  last_purchase_at?: string | null;
  preferred_delivery?: string | null;
  created_at: string;
}

export default function CustomersPage() {
  const { businessId } = useBusiness();
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const loadCustomers = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const data = await getCustomers(businessId, search);
      setCustomers(data);
    } catch (err) {
      console.error("Failed to load customers:", err);
    } finally {
      setLoading(false);
    }
  }, [businessId, search]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const handleDelete = async (id: string) => {
    if (!businessId) return;
    if (!confirm("Delete this customer?")) return;
    try {
      await deleteCustomer(businessId, id);
      loadCustomers();
    } catch (err) {
      console.error("Failed to delete customer:", err);
    }
  };

  const totalOutstanding = customers.reduce((sum, c) => sum + (c.outstanding_balance || 0), 0);
  const totalSpend = customers.reduce((sum, c) => sum + (c.total_spend || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">{customers.length} customers</p>
        </div>
        <div className="flex gap-2">
          <ExportButton
            data={formatCustomersForCsv(customers as unknown as Record<string, unknown>[])}
            filename={`customers-${new Date().toISOString().split("T")[0]}`}
          />
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border bg-card p-4 text-center">
          <Users className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
          <div className="text-2xl font-bold">{customers.length}</div>
          <div className="text-xs text-muted-foreground">Total Customers</div>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <IndianRupee className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
          <div className="text-2xl font-bold text-[#DC2626]">₹{totalOutstanding.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">Outstanding</div>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <IndianRupee className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
          <div className="text-2xl font-bold text-foreground">₹{totalSpend.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">Total Spend</div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or phone..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Customer List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : customers.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center">
          <UserCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {search ? "No customers found" : "No customers yet"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {search ? "Try a different search" : "Add your first customer to get started"}
          </p>
          {!search && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {customers.map((customer) => (
            <Link
              key={customer.id}
              href={`/customers/${customer.id}`}
              className="block rounded-xl border bg-card p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    {customer.name.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{customer.name}</div>
                  {customer.phone && (
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {customer.phone}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  {customer.outstanding_balance > 0 ? (
                    <Badge variant="destructive" className="text-xs">
                      ₹{customer.outstanding_balance.toLocaleString()} due
                    </Badge>
                  ) : customer.total_spend > 0 ? (
                    <Badge variant="secondary" className="text-xs">
                      ₹{customer.total_spend.toLocaleString()} spent
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">New</Badge>
                  )}
                </div>
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.preventDefault();
                      setMenuOpen(menuOpen === customer.id ? null : customer.id);
                    }}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                  {menuOpen === customer.id && (
                    <div className="absolute right-0 top-8 z-50 w-40 rounded-lg border bg-popover shadow-md">
                      <button
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                        onClick={(e) => {
                          e.preventDefault();
                          setEditingCustomer(customer);
                          setMenuOpen(null);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[#DC2626] hover:bg-muted"
                        onClick={(e) => {
                          e.preventDefault();
                          handleDelete(customer.id);
                          setMenuOpen(null);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Customer</DialogTitle>
          </DialogHeader>
          <CustomerForm
            businessId={businessId}
            onCancel={() => setShowForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Form Dialog */}
      <Dialog open={!!editingCustomer} onOpenChange={() => setEditingCustomer(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
          </DialogHeader>
          {editingCustomer && (
            <CustomerForm
              businessId={businessId}
              customer={editingCustomer}
              onCancel={() => setEditingCustomer(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
