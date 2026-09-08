"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  dismissNotification,
} from "@/server/actions/notifications";
import { useBusiness } from "@/lib/store";
import {
  Bell, Package, Receipt, Users, CreditCard, Settings,
  Check, CheckCheck, Trash2, X
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
  low_stock: "text-[#DC2626]",
  payment_due: "text-[#DC2626]",
  expense_alert: "text-[#DC2626]",
  invoice_created: "text-foreground",
  po_received: "text-foreground",
  team_joined: "text-foreground",
  system: "text-muted-foreground",
};

export function NotificationBell() {
  const { businessId } = useBusiness();
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: string;
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
    entity_type?: string | null;
    entity_id?: string | null;
  }>>([]);
  const [loading, setLoading] = useState(false);

  const loadCount = useCallback(async () => {
    if (!businessId) return;
    try {
      const c = await getUnreadCount(businessId);
      setCount(c);
    } catch {
      // silent
    }
  }, [businessId]);

  useEffect(() => {
    loadCount();
    const interval = setInterval(loadCount, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, [loadCount]);

  const loadNotifications = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const data = await getNotifications(businessId);
      setNotifications(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  const handleOpen = () => {
    if (!open) {
      loadNotifications();
    }
    setOpen(!open);
  };

  const handleMarkRead = async (id: string) => {
    if (!businessId) return;
    await markAsRead(businessId, id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setCount((prev) => Math.max(0, prev - 1));
  };

  const handleMarkAllRead = async () => {
    if (!businessId) return;
    await markAllAsRead(businessId);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setCount(0);
  };

  const handleDismiss = async (id: string) => {
    if (!businessId) return;
    await dismissNotification(businessId, id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="relative">
      <Button variant="ghost" size="icon" onClick={handleOpen} className="relative">
        <Bell className="h-5 w-5" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#DC2626] text-white text-xs flex items-center justify-center font-bold">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 rounded-xl border bg-popover shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b">
              <h3 className="font-semibold">Notifications</h3>
              <div className="flex gap-1">
                {count > 0 && (
                  <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="text-xs h-7">
                    <CheckCheck className="h-3 w-3 mr-1" />
                    Mark all read
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-[400px] overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-muted-foreground text-sm">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="h-8 w-8 mx-auto text-muted-foreground mb-2 opacity-50" />
                  <p className="text-sm text-muted-foreground">No notifications</p>
                </div>
              ) : (
                notifications.map((notif) => {
                  const Icon = TYPE_ICONS[notif.type] || Bell;
                  const iconColor = TYPE_COLORS[notif.type] || "text-gray-500";
                  return (
                    <div
                      key={notif.id}
                      className={`flex items-start gap-3 p-3 border-b last:border-0 hover:bg-muted/50 transition-colors ${
                        !notif.is_read ? "bg-[#DC2626]/5" : ""
                      }`}
                    >
                      <div className={`mt-0.5 ${iconColor}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium">{notif.title}</span>
                          {!notif.is_read && (
                            <span className="h-2 w-2 rounded-full bg-[#DC2626] shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {notif.message}
                        </p>
                        <div className="text-[10px] text-muted-foreground mt-1">
                          {new Date(notif.created_at).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        {!notif.is_read && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleMarkRead(notif.id)}
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground"
                          onClick={() => handleDismiss(notif.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-2 border-t">
                <Link
                  href="/notifications"
                  className="block text-center text-sm text-foreground hover:text-[#DC2626] transition-colors py-1"
                  onClick={() => setOpen(false)}
                >
                  View all notifications
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
