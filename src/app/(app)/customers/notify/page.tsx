"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { createBroadcast, getCustomersWithPhone, sendBroadcastWhatsApp, getTemplatePreview } from "@/server/actions/broadcasts";
import { useBusiness } from "@/lib/store";
import type { BroadcastTemplateType, BroadcastChannel } from "@/types/database";
import {
  ArrowLeft, Send, Users, MessageCircle, Package, Tag,
  Megaphone, CheckSquare, Square, Loader2, Search, History
} from "lucide-react";

interface Customer { id: string; name: string; phone: string | null; }

const TEMPLATES: { type: BroadcastTemplateType; label: string; icon: typeof Package; description: string }[] = [
  { type: "new_stock", label: "New Stock Arrival", icon: Package, description: "Announce new products in stock" },
  { type: "offer", label: "Special Offer", icon: Tag, description: "Promote discounts and deals" },
  { type: "restock", label: "Restocked", icon: Megaphone, description: "Tell customers items are back" },
  { type: "back_in_stock", label: "Back in Stock", icon: Package, description: "Notify about restocked items" },
  { type: "custom", label: "Custom Message", icon: MessageCircle, description: "Write your own message" },
];

export default function NotifyCustomersPage() {
  const { businessId, business } = useBusiness();
  const router = useRouter();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [template, setTemplate] = useState<BroadcastTemplateType>("new_stock");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [channel, setChannel] = useState<BroadcastChannel>("whatsapp");
  const [productName, setProductName] = useState("");
  const [offerText, setOfferText] = useState("");
  const [step, setStep] = useState<"select" | "compose" | "review">("select");

  const loadCustomers = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const data = await getCustomersWithPhone(businessId);
      setCustomers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => { loadCustomers(); }, [loadCustomers]);

  useEffect(() => {
    if (business) {
      const preview = getTemplatePreview(template, {
        businessName: business.name,
        productName: productName || undefined,
        offerText: offerText || undefined,
      });
      setTitle(preview.title);
      setMessage(preview.message);
    }
  }, [template, business, productName, offerText]);

  const toggleCustomer = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  const toggleAll = () => {
    const filtered = filteredCustomers;
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((c) => c.id)));
    }
  };

  const filteredCustomers = customers.filter((c) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return c.name.toLowerCase().includes(s) || (c.phone && c.phone.includes(s));
  });

  const handleSend = async () => {
    if (!businessId || !title || !message || selectedIds.size === 0) return;
    setSending(true);
    try {
      const broadcast = await createBroadcast(businessId, {
        title, message, template_type: template, channel,
        customer_ids: Array.from(selectedIds),
      });
      const result = await sendBroadcastWhatsApp(businessId, broadcast.id);
      alert(`Sent to ${result.sentCount} of ${result.total} customers`);
      router.push("/customers/notify/history");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Notify Customers</h1>
            <p className="text-muted-foreground">Send stock & offer notifications via WhatsApp</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => router.push("/customers/notify/history")}>
          <History className="mr-2 h-4 w-4" /> History
        </Button>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2 text-sm">
        {["select", "compose", "review"].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${
              step === s ? "bg-primary text-primary-foreground" :
              ["select", "compose", "review"].indexOf(step) > i ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
            }`}>{i + 1}</div>
            <span className={step === s ? "font-medium" : "text-muted-foreground"}>{s.charAt(0).toUpperCase() + s.slice(1)}</span>
            {i < 2 && <div className="w-8 h-px bg-border" />}
          </div>
        ))}
      </div>

      {/* Step 1: Select Customers */}
      {step === "select" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>Select Customers ({selectedIds.size} of {customers.length})</span>
              <Button variant="ghost" size="sm" onClick={toggleAll}>
                {selectedIds.size === filteredCustomers.length ? <CheckSquare className="h-4 w-4 mr-1" /> : <Square className="h-4 w-4 mr-1" />}
                {selectedIds.size === filteredCustomers.length ? "Deselect All" : "Select All"}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by name or phone..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>

            {loading ? (
              <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-muted animate-pulse rounded-lg" />)}</div>
            ) : filteredCustomers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">{search ? "No matching customers" : "No customers with phone numbers"}</p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto space-y-1">
                {filteredCustomers.map((c) => (
                  <label key={c.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                    <Checkbox checked={selectedIds.has(c.id)} onCheckedChange={() => toggleCustomer(c.id)} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{c.name}</div>
                      <div className="text-xs text-muted-foreground">{c.phone}</div>
                    </div>
                    {selectedIds.has(c.id) && <Badge variant="secondary" className="text-xs">Selected</Badge>}
                  </label>
                ))}
              </div>
            )}

            <Button onClick={() => setStep("compose")} disabled={selectedIds.size === 0} className="w-full">
              Continue with {selectedIds.size} customer{selectedIds.size !== 1 ? "s" : ""}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Compose Message */}
      {step === "compose" && (
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Message Template</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.type}
                    onClick={() => setTemplate(t.type)}
                    className={`rounded-lg border p-3 text-left transition-all ${
                      template === t.type ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                    }`}
                  >
                    <t.icon className="h-4 w-4 mb-1" />
                    <div className="text-xs font-medium">{t.label}</div>
                    <div className="text-[10px] text-muted-foreground">{t.description}</div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {template !== "custom" && (
            <Card>
              <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label>Product Name (optional)</Label>
                  <Input placeholder="e.g. iPhone 15, Nike Shoes" value={productName} onChange={(e) => setProductName(e.target.value)} />
                </div>
                {template === "offer" && (
                  <div className="space-y-2">
                    <Label>Offer Details</Label>
                    <Input placeholder="e.g. 20% off on all electronics" value={offerText} onChange={(e) => setOfferText(e.target.value)} />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle className="text-base">Message</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea rows={6} value={message} onChange={(e) => setMessage(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Channel</Label>
                <Select value={channel} onValueChange={(v) => v && setChannel(v as BroadcastChannel)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep("select")} className="flex-1">Back</Button>
            <Button onClick={() => setStep("review")} disabled={!title || !message} className="flex-1">Review</Button>
          </div>
        </div>
      )}

      {/* Step 3: Review & Send */}
      {step === "review" && (
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Review Broadcast</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Template</span>
                <Badge>{TEMPLATES.find((t) => t.type === template)?.label}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Recipients</span>
                <span className="font-medium">{selectedIds.size} customers</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Channel</span>
                <Badge variant="outline">{channel}</Badge>
              </div>
              <div className="rounded-lg bg-muted/50 p-4">
                <div className="text-sm font-medium mb-2">{title}</div>
                <div className="text-sm text-muted-foreground whitespace-pre-wrap">{message}</div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep("compose")} className="flex-1">Back</Button>
            <Button onClick={handleSend} disabled={sending} className="flex-1 bg-green-600 hover:bg-green-700">
              {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Send via WhatsApp
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
