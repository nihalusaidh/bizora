"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getBroadcasts, deleteBroadcast } from "@/server/actions/broadcasts";
import { useBusiness } from "@/lib/store";
import type { CustomerBroadcast } from "@/types/database";
import { ArrowLeft, Megaphone, Trash2, Send, Clock, CheckCircle, AlertTriangle } from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  draft: { label: "Draft", color: "bg-muted text-foreground", icon: Clock },
  sending: { label: "Sending", color: "bg-primary/10 text-primary", icon: Send },
  sent: { label: "Sent", color: "bg-green-500/10 text-green-600", icon: CheckCircle },
  partial: { label: "Partial", color: "bg-yellow-500/10 text-yellow-600", icon: AlertTriangle },
  failed: { label: "Failed", color: "bg-[#DC2626]/10 text-[#DC2626]", icon: AlertTriangle },
};

export default function BroadcastHistoryPage() {
  const { businessId } = useBusiness();
  const router = useRouter();
  const [broadcasts, setBroadcasts] = useState<CustomerBroadcast[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const data = await getBroadcasts(businessId);
      setBroadcasts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this broadcast?")) return;
    await deleteBroadcast(businessId!, id);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/customers/notify")}><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Broadcast History</h1>
            <p className="text-muted-foreground">{broadcasts.length} broadcasts</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />)}</div>
      ) : broadcasts.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center">
          <Megaphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No broadcasts yet</h3>
          <p className="text-muted-foreground mb-4">Send your first notification to customers</p>
          <Button onClick={() => router.push("/customers/notify")}>Create Broadcast</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {broadcasts.map((b) => {
            const cfg = STATUS_CONFIG[b.status] || STATUS_CONFIG.draft;
            const StatusIcon = cfg.icon;
            return (
              <Card key={b.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Megaphone className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{b.title}</span>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.color}`}>
                          <StatusIcon className="h-3 w-3" /> {cfg.label}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{b.message}</div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{b.recipient_count} recipients</span>
                        <span>{b.sent_count} sent</span>
                        <Badge variant="outline" className="text-[10px]">{b.channel}</Badge>
                      </div>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      {b.sent_at ? new Date(b.sent_at).toLocaleDateString() : new Date(b.created_at).toLocaleDateString()}
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(b.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
