"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  dismissNotification,
  generateAlerts,
} from "@/server/actions/notifications";
import { useBusiness } from "@/lib/store";
import {
  ArrowLeft, Bell, Package, Receipt, Users, CreditCard,
  Settings, Check, CheckCheck, Trash2, RefreshCw, Sparkles
} from "lucide-react";

const TYPE_ICONS: Record<string, typeof Bell> = {
  low_stock: Package,
  payment_due: Receipt,
  expense_alert: CreditCard,
  invoice_created: Receipt,
  po_received: Package,
  team_joined: Users,
  system: Settings,
};

const TYPE_COLORS: Record<string, string> = {
  low_stock: "text-orange-500",
  payment_due: "text-red-500",
  expense_alert: "text-destructive",
  invoice_created: "text-green-500",
  po_received: "text-blue-500",
  team_joined: "text-purple-500",
  system: "text-gray-500",
};

const TYPE_LABELS: Record<string, string> = {
  low_stock: "Low Stock",
  payment_due: "Payment Due",
  expense_alert: "Expense Alert",
  invoice_created: "Invoice",
  po_received: "Purchase",
  team_joined: "Team",
  system: "System",
};

export default function NotificationsPage() {
  const { businessId } = useBusiness();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: string;
    title: string;
    message: string;
    is_read: boolean;
    is_dismissed: boolean;
    entity_type?: string | null;
    entity_id?: string | null;
    created_at: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const load = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const data = await getNotifications(businessId);
      setNotifications(data);
    } catch (err) {
      console.error("Failed to load:", err);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleMarkRead = async (id: string) => {
    if (!businessId) return;
    await markAsRead(businessId, id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const handleMarkAllRead = async () => {
    if (!businessId) return;
    await markAllAsRead(businessId);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const handleDismiss = async (id: string) => {
    if (!businessId) return;
    await dismissNotification(businessId, id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleGenerateAlerts = async () => {
    if (!businessId) return;
    setGenerating(true);
    try {
      await generateAlerts(businessId);
      load();
    } catch (err) {
      console.error("Failed to generate:", err);
    } finally {
      setGenerating(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // Group by type
  const grouped = notifications.reduce((acc, notif) => {
    if (!acc[notif.type]) acc[notif.type] = [];
    acc[notif.type].push(notif);
    return acc;
  }, {} as Record<string, typeof notifications>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
            <p className="text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleGenerateAlerts} disabled={generating}>
            <Sparkles className={`h-4 w-4 mr-1 ${generating ? "animate-spin" : ""}`} />
            Scan Alerts
          </Button>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
              <CheckCheck className="h-4 w-4 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {/* Alert Generator Card */}
      <div className="rounded-xl border bg-gradient-to-r from-primary/5 to-primary/10 p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="font-medium">Smart Alerts</div>
            <div className="text-sm text-muted-foreground">
              Scan your business data for low stock, pending payments, and more
            </div>
          </div>
          <Button size="sm" onClick={handleGenerateAlerts} disabled={generating}>
            {generating ? "Scanning..." : "Scan Now"}
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-xl border bg-card p-8 text-center">
          <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No notifications</h3>
          <p className="text-muted-foreground mb-4">
            You&apos;re all caught up! Run a scan to check for alerts.
          </p>
          <Button onClick={handleGenerateAlerts} disabled={generating}>
            <Sparkles className="h-4 w-4 mr-2" />
            Scan for Alerts
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([type, items]) => {
            const Icon = TYPE_ICONS[type] || Bell;
            const iconColor = TYPE_COLORS[type] || "text-gray-500";
            return (
              <div key={type}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon className={`h-4 w-4 ${iconColor}`} />
                  <h3 className="font-semibold text-sm">{TYPE_LABELS[type] || type}</h3>
                  <Badge variant="secondary" className="text-xs">{items.length}</Badge>
                </div>
                <div className="space-y-2">
                  {items.map((notif) => (
                    <div
                      key={notif.id}
                      className={`flex items-start gap-3 rounded-xl border bg-card p-4 ${
                        !notif.is_read ? "border-primary/30 bg-primary/5" : ""
                      }`}
                    >
                      <div className={`mt-0.5 ${iconColor}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-sm">{notif.title}</span>
                          {!notif.is_read && (
                            <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{notif.message}</p>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(notif.created_at).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {!notif.is_read && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleMarkRead(notif.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground"
                          onClick={() => handleDismiss(notif.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
