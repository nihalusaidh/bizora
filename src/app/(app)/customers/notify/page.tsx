"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { createBroadcast, getCustomersWithPhone, sendBroadcastWhatsApp } from "@/server/actions/broadcasts";
import { useBusiness } from "@/lib/store";
import type { BroadcastTemplateType } from "@/types/database";
import {
  ArrowLeft, Send, Users, MessageCircle, Package, Tag,
  Megaphone, CheckSquare, Square, Loader2, Search, History,
  Zap, Phone, ShoppingBag, Percent, PartyPopper
} from "lucide-react";

interface Customer { id: string; name: string; phone: string | null; }

const QUICK_TEMPLATES: {
  type: BroadcastTemplateType;
  label: string;
  icon: typeof Package;
  color: string;
  message: (name: string) => string;
}[] = [
  {
    type: "new_stock",
    label: "New Stock",
    icon: Package,
    color: "text-blue-500 bg-blue-500/10",
    message: (name) => `Hi! 🎉\n\nExciting news from ${name}!\n\nNew stock just arrived. Come check it out before it's gone!\n\nShop now or reply to this message to order.`,
  },
  {
    type: "restock",
    label: "Back in Stock",
    icon: ShoppingBag,
    color: "text-green-500 bg-green-500/10",
    message: (name) => `Hey! ✅\n\nGood news — your favourite items are back in stock at ${name}!\n\nHurry, limited quantity available.\n\nReply to order or visit us today!`,
  },
  {
    type: "offer",
    label: "Special Offer",
    icon: Percent,
    color: "text-orange-500 bg-orange-500/10",
    message: (name) => `🔥 Special Offer at ${name}!\n\nDon't miss out on amazing deals!\n\nReply "DEALS" to know more or visit us today.`,
  },
  {
    type: "back_in_stock",
    label: "Flash Sale",
    icon: Zap,
    color: "text-yellow-500 bg-yellow-500/10",
    message: (name) => `⚡ Flash Sale at ${name}!\n\nLimited time offers on selected items.\n\nReply "SALE" to get the list or visit us now!`,
  },
  {
    type: "custom",
    label: "Custom",
    icon: MessageCircle,
    color: "text-purple-500 bg-purple-500/10",
    message: () => "",
  },
];

export default function NotifyPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>}>
      <NotifyCustomersPage />
    </Suspense>
  );
}

function NotifyCustomersPage() {
  const { businessId, business } = useBusiness();
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillType = searchParams.get("type") as BroadcastTemplateType | null;
  const prefillProduct = searchParams.get("product");

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sentCount, setSentCount] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedTemplate, setSelectedTemplate] = useState<BroadcastTemplateType>("new_stock");
  const [customMessage, setCustomMessage] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [productName, setProductName] = useState("");
  const [offerText, setOfferText] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [sent, setSent] = useState(false);

  const loadCustomers = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const data = await getCustomersWithPhone(businessId);
      setCustomers(data);
      setSelectedIds(new Set(data.map((c) => c.id)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => { loadCustomers(); }, [loadCustomers]);

  useEffect(() => {
    if (prefillType && QUICK_TEMPLATES.find((t) => t.type === prefillType)) {
      setSelectedTemplate(prefillType);
    }
    if (prefillProduct) {
      setProductName(prefillProduct);
    }
  }, [prefillType, prefillProduct]);

  const filteredCustomers = customers.filter((c) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return c.name.toLowerCase().includes(s) || (c.phone && c.phone.includes(s));
  });

  const toggleCustomer = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  const toggleAll = () => {
    if (selectedIds.size === filteredCustomers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredCustomers.map((c) => c.id)));
    }
  };

  const getMessage = () => {
    if (selectedTemplate === "custom") return customMessage;
    const tpl = QUICK_TEMPLATES.find((t) => t.type === selectedTemplate);
    if (!tpl) return "";
    let msg = tpl.message(business?.name || "Our Store");
    if (productName) {
      msg = msg.replace("items", productName).replace("favourite items", productName).replace("selected items", productName);
    }
    if (offerText && selectedTemplate === "offer") {
      msg = msg.replace("amazing deals", offerText);
    }
    return msg;
  };

  const getTitle = () => {
    if (selectedTemplate === "custom") return customTitle || "Custom Message";
    if (productName) return `${selectedTemplate === "new_stock" ? "New Stock" : selectedTemplate === "restock" ? "Back in Stock" : selectedTemplate === "offer" ? "Special Offer" : "Flash Sale"}: ${productName}`;
    return QUICK_TEMPLATES.find((t) => t.type === selectedTemplate)?.label || "Message";
  };

  const handleQuickSend = async () => {
    if (!businessId || selectedIds.size === 0) return;
    const msg = getMessage();
    if (!msg) return;

    setSending(true);
    try {
      const broadcast = await createBroadcast(businessId, {
        title: getTitle(),
        message: msg,
        template_type: selectedTemplate,
        channel: "whatsapp",
        customer_ids: Array.from(selectedIds),
      });
      const result = await sendBroadcastWhatsApp(businessId, broadcast.id);
      setSentCount(result.sentCount);
      setSent(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed");
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-5 w-5" /></Button>
          <h1 className="text-2xl font-bold tracking-tight">Broadcast Sent!</h1>
        </div>
        <Card>
          <CardContent className="p-8 text-center space-y-4">
            <div className="text-5xl">🎉</div>
            <h2 className="text-xl font-bold">WhatsApp Messages Opened!</h2>
            <p className="text-muted-foreground">
              {sentCount} WhatsApp chat{sentCount !== 1 ? "s" : ""} opened for your customers.
              Each customer will see the message and can reply directly.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => { setSent(false); setSentCount(0); setSelectedIds(new Set(customers.map((c) => c.id))); }}>
                Send Another
              </Button>
              <Link href="/customers/notify/history">
                <Button>View History</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Notify Customers</h1>
            <p className="text-muted-foreground">One-click WhatsApp broadcast to your customers</p>
          </div>
        </div>
        <Link href="/customers/notify/history">
          <Button variant="outline"><History className="mr-2 h-4 w-4" /> History</Button>
        </Link>
      </div>

      {/* Quick Template Picker */}
      <Card>
        <CardHeader><CardTitle className="text-base">What are you announcing?</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
            {QUICK_TEMPLATES.map((t) => (
              <button
                key={t.type}
                onClick={() => setSelectedTemplate(t.type)}
                className={`rounded-lg border p-3 text-center transition-all ${
                  selectedTemplate === t.type ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:bg-muted/50"
                }`}
              >
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center mx-auto mb-2 ${t.color}`}>
                  <t.icon className="h-5 w-5" />
                </div>
                <div className="text-xs font-medium">{t.label}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Details */}
      {selectedTemplate !== "custom" && (
        <Card>
          <CardHeader><CardTitle className="text-base">Details (optional)</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label>Product Name</Label>
              <Input
                placeholder={selectedTemplate === "offer" ? "e.g. All Electronics, Summer Collection" : "e.g. iPhone 15, Nike Air Max"}
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
            </div>
            {selectedTemplate === "offer" && (
              <div className="space-y-2">
                <Label>Offer Details</Label>
                <Input placeholder="e.g. Flat 20% off, Buy 1 Get 1 Free" value={offerText} onChange={(e) => setOfferText(e.target.value)} />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Custom Message */}
      {selectedTemplate === "custom" && (
        <Card>
          <CardHeader><CardTitle className="text-base">Your Message</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label>Title (internal)</Label>
              <Input placeholder="e.g. Diwali Sale Announcement" value={customTitle} onChange={(e) => setCustomTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                rows={5}
                placeholder="Type your message here..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Message Preview */}
      <Card>
        <CardHeader><CardTitle className="text-base">Preview</CardTitle></CardHeader>
        <CardContent>
          <div className="rounded-lg bg-green-500/5 border border-green-500/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="text-sm font-medium">{business?.name || "Your Business"}</div>
                <div className="text-[10px] text-muted-foreground">WhatsApp Business</div>
              </div>
            </div>
            <div className="bg-white dark:bg-green-900/20 rounded-lg p-3 text-sm whitespace-pre-wrap shadow-sm">
              {getMessage() || "Select a template above to see preview"}
            </div>
            <div className="text-[10px] text-muted-foreground mt-1 text-right">
              {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>
              <Users className="inline h-4 w-4 mr-1" />
              Recipients ({selectedIds.size} of {customers.length})
            </span>
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
            <>
              <div className="max-h-64 overflow-y-auto space-y-1">
                {filteredCustomers.slice(0, showAdvanced ? filteredCustomers.length : 10).map((c) => (
                  <label key={c.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                    <Checkbox checked={selectedIds.has(c.id)} onCheckedChange={() => toggleCustomer(c.id)} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{c.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {c.phone}
                      </div>
                    </div>
                    {selectedIds.has(c.id) && <Badge variant="secondary" className="text-xs">✓</Badge>}
                  </label>
                ))}
              </div>
              {filteredCustomers.length > 10 && !showAdvanced && (
                <Button variant="ghost" size="sm" onClick={() => setShowAdvanced(true)} className="w-full">
                  Show all {filteredCustomers.length} customers
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Send Button */}
      <div className="sticky bottom-4">
        <Button
          size="lg"
          onClick={handleQuickSend}
          disabled={sending || selectedIds.size === 0 || !getMessage()}
          className="w-full bg-green-600 hover:bg-green-700 text-white h-14 text-lg"
        >
          {sending ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Send className="mr-2 h-5 w-5" />
          )}
          Send to {selectedIds.size} Customer{selectedIds.size !== 1 ? "s" : ""} via WhatsApp
        </Button>
      </div>
    </div>
  );
}
