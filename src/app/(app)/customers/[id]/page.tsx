"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomerForm } from "@/components/customers/customer-form";
import { PaymentForm } from "@/components/customers/payment-form";
import { CreditForm } from "@/components/customers/credit-form";
import { getCustomer, deleteCustomer, sendPaymentReminder } from "@/server/actions/customers";
import { getCustomerPayments } from "@/server/actions/khata";
import { getCustomerCredit, markCreditPaid } from "@/server/actions/khata";
import { getLoyaltyBalance } from "@/server/actions/loyalty";
import { useBusiness } from "@/lib/store";
import { PaymentReminder } from "@/components/billing/payment-reminder";
import {
  ArrowLeft, Edit, Trash2, Phone, Mail, MapPin,
  IndianRupee, Calendar, CreditCard, AlertCircle,
  CheckCircle, Clock, Gift
} from "lucide-react";

interface Customer {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  gst_number?: string | null;
  outstanding_balance: number;
  total_spend: number;
  purchase_count: number;
  last_purchase_at?: string | null;
  preferred_delivery?: string | null;
  notes?: string | null;
  created_at: string;
}

interface Payment {
  id: string;
  amount: number;
  payment_method: string;
  reference?: string | null;
  notes?: string | null;
  created_at: string;
}

interface Credit {
  id: string;
  amount: number;
  type: string;
  description?: string | null;
  due_date?: string | null;
  status: string;
  created_at: string;
}

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { businessId } = useBusiness();
  const customerId = params.id as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [credits, setCredits] = useState<Credit[]>([]);
  const [loyaltyPoints, setLoyaltyPoints] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showCreditForm, setShowCreditForm] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(false);

  const loadData = useCallback(async () => {
    if (!businessId || !customerId) return;
    setLoading(true);
    try {
      const [cust, pays, creds, loyalty] = await Promise.all([
        getCustomer(businessId, customerId),
        getCustomerPayments(customerId),
        getCustomerCredit(businessId, customerId),
        getLoyaltyBalance(customerId),
      ]);
      setCustomer(cust);
      setPayments(pays);
      setCredits(creds);
      setLoyaltyPoints(loyalty);
    } catch (err) {
      console.error("Failed to load customer:", err);
    } finally {
      setLoading(false);
    }
  }, [businessId, customerId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSendReminder = async () => {
    if (!businessId || !customerId) return;
    const latestPendingCredit = credits.find(c => c.status === "pending" && c.type === "credit");
    if (!latestPendingCredit) return;
    setSendingReminder(true);
    try {
      await sendPaymentReminder(businessId, customerId, latestPendingCredit.id);
      alert("Payment reminder sent successfully!");
    } catch (err) {
      console.error("Failed to send reminder:", err);
      alert("Failed to send reminder. Make sure the customer has an email address.");
    } finally {
      setSendingReminder(false);
    }
  };

  const handleDelete = async () => {
    if (!businessId || !customerId) return;
    if (!confirm("Delete this customer?")) return;
    try {
      await deleteCustomer(businessId, customerId);
      router.push("/customers");
    } catch (err) {
      console.error("Failed to delete customer:", err);
    }
  };

  const handleMarkPaid = async (creditId: string, amount: number) => {
    if (!businessId) return;
    try {
      await markCreditPaid(businessId, creditId, customerId, amount);
      loadData();
    } catch (err) {
      console.error("Failed to mark as paid:", err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-32 bg-muted animate-pulse rounded" />
        <div className="h-48 bg-muted animate-pulse rounded-xl" />
        <div className="h-64 bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="space-y-6">
        <Link href="/customers" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Customers
        </Link>
        <div className="rounded-xl border bg-card p-8 text-center">
          <h3 className="text-lg font-semibold mb-2">Customer not found</h3>
          <Link href="/customers">
            <Button>Go to Customers</Button>
          </Link>
        </div>
      </div>
    );
  }

  const pendingCredits = credits.filter(c => c.status === "pending" && c.type === "credit");
  const paidCredits = credits.filter(c => c.status === "paid" || c.type !== "credit");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/customers" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Customers
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => setShowEditForm(true)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xl font-bold text-primary">
                {customer.name.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold">{customer.name}</h1>
              {customer.phone && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  {customer.phone}
                </div>
              )}
              {customer.email && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  {customer.email}
                </div>
              )}
              {customer.address && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {customer.address}
                </div>
              )}
            </div>
            {customer.outstanding_balance > 0 && (
              <Badge variant="destructive" className="text-sm">
                ₹{customer.outstanding_balance.toLocaleString()} due
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border bg-card p-4 text-center">
          <div className="text-2xl font-bold">₹{(customer.total_spend || 0).toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">Total Spend</div>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <div className="text-2xl font-bold">{customer.purchase_count || 0}</div>
          <div className="text-xs text-muted-foreground">Purchases</div>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <div className="text-2xl font-bold text-[#DC2626]">₹{(customer.outstanding_balance || 0).toLocaleString()}</div>
          <div className="text-xs text-muted-foreground">Outstanding</div>
        </div>
      </div>

      {/* Loyalty Points */}
      {loyaltyPoints > 0 && (
        <div className="rounded-xl border bg-card p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center">
            <Gift className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <div className="text-lg font-bold">{loyaltyPoints} points</div>
            <div className="text-xs text-muted-foreground">Loyalty Points Balance</div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button onClick={() => setShowPaymentForm(true)}>
          <IndianRupee className="mr-2 h-4 w-4" />
          Record Payment
        </Button>
        <Button variant="outline" onClick={() => setShowCreditForm(true)}>
          <CreditCard className="mr-2 h-4 w-4" />
          Add Credit
        </Button>
      </div>

      {/* Send Reminder Button */}
      {customer.outstanding_balance > 0 && customer.email && (
        <Button
          variant="outline"
          className="w-full"
          onClick={handleSendReminder}
          disabled={sendingReminder}
        >
          <Mail className="mr-2 h-4 w-4" />
          {sendingReminder ? "Sending..." : "Send Email Reminder"}
        </Button>
      )}

      {/* Payment Reminder */}
      {customer.outstanding_balance > 0 && customer.phone && (
        <PaymentReminder
          customerName={customer.name}
          customerPhone={customer.phone}
          outstandingAmount={customer.outstanding_balance}
        />
      )}

      {/* Tabs */}
      <Tabs defaultValue="credits">
        <TabsList className="w-full">
          <TabsTrigger value="credits" className="flex-1">
            Khata ({pendingCredits.length})
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex-1">
            Payments ({payments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="credits" className="space-y-3 mt-4">
          {pendingCredits.length === 0 ? (
            <div className="rounded-xl border bg-card p-6 text-center">
              <CheckCircle className="h-8 w-8 mx-auto text-foreground mb-2" />
              <p className="text-muted-foreground">No pending credits</p>
            </div>
          ) : (
            pendingCredits.map((credit) => (
              <div key={credit.id} className="rounded-xl border bg-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">₹{credit.amount.toLocaleString()}</div>
                    {credit.description && (
                      <div className="text-sm text-muted-foreground">{credit.description}</div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(credit.created_at).toLocaleDateString()}
                      {credit.due_date && (
                        <>
                          <Clock className="h-3 w-3" />
                          Due: {new Date(credit.due_date).toLocaleDateString()}
                        </>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleMarkPaid(credit.id, credit.amount)}
                  >
                    Mark Paid
                  </Button>
                </div>
              </div>
            ))
          )}
          {paidCredits.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Completed</h4>
              {paidCredits.map((credit) => (
                <div key={credit.id} className="rounded-xl border bg-card p-4 opacity-60">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">₹{credit.amount.toLocaleString()}</div>
                      {credit.description && (
                        <div className="text-sm text-muted-foreground">{credit.description}</div>
                      )}
                    </div>
                    <Badge variant="secondary">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Paid
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="payments" className="space-y-3 mt-4">
          {payments.length === 0 ? (
            <div className="rounded-xl border bg-card p-6 text-center">
              <IndianRupee className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No payments recorded</p>
            </div>
          ) : (
            payments.map((payment) => (
              <div key={payment.id} className="rounded-xl border bg-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-foreground">+₹{payment.amount.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground capitalize">
                      {payment.payment_method.replace("_", " ")}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(payment.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  {payment.reference && (
                    <div className="text-xs text-muted-foreground">
                      Ref: {payment.reference}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Form Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
          </DialogHeader>
          <CustomerForm
            businessId={businessId}
            customer={customer}
            onCancel={() => setShowEditForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Payment Form Dialog */}
      <Dialog open={showPaymentForm} onOpenChange={setShowPaymentForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          <PaymentForm
            businessId={businessId}
            customerId={customerId}
            onSuccess={() => {
              loadData();
              setShowPaymentForm(false);
            }}
            onCancel={() => setShowPaymentForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Credit Form Dialog */}
      <Dialog open={showCreditForm} onOpenChange={setShowCreditForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Credit</DialogTitle>
          </DialogHeader>
          <CreditForm
            businessId={businessId}
            customerId={customerId}
            onSuccess={() => {
              loadData();
              setShowCreditForm(false);
            }}
            onCancel={() => setShowCreditForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
