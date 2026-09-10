"use client";

import { useEffect, useRef, useCallback } from "react";
import { processSyncQueue, type SyncQueueItem } from "@/lib/offline-db";
import { createClient } from "@/lib/supabase/client";

const TABLE_MAP: Record<string, string> = {
  pending_invoices: "invoices",
  pending_customers: "customers",
  pending_products: "products",
  pending_expenses: "expenses",
  pending_payments: "customer_payments",
};

async function processItem(item: SyncQueueItem): Promise<boolean> {
  const supabase = createClient();
  const table = TABLE_MAP[item.table_name] || item.table_name;

  try {
    switch (item.operation) {
      case "insert": {
        const { error } = await supabase.from(table).insert(item.data);
        if (error) throw error;
        return true;
      }
      case "update": {
        const { id, ...updates } = item.data;
        const { error } = await supabase.from(table).update(updates).eq("id", id || item.record_id);
        if (error) throw error;
        return true;
      }
      case "delete": {
        const { error } = await supabase.from(table).delete().eq("id", item.record_id);
        if (error) throw error;
        return true;
      }
      default:
        return false;
    }
  } catch (err) {
    console.error(`Sync failed for ${table}:`, err);
    return false;
  }
}

export function useSyncManager() {
  const isSyncingRef = useRef(false);

  const syncNow = useCallback(async () => {
    if (isSyncingRef.current || !navigator.onLine) return;

    isSyncingRef.current = true;
    try {
      const result = await processSyncQueue(processItem);
      if (result.processed > 0) {
        console.log(`Synced ${result.processed} offline changes`);
      }
      if (result.failed > 0) {
        console.warn(`${result.failed} sync items failed`);
      }
    } catch (err) {
      console.error("Sync manager error:", err);
    } finally {
      isSyncingRef.current = false;
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setTimeout(syncNow, 1000);
    };

    const handleOfflineSync = () => {
      syncNow();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline-sync", handleOfflineSync);

    // Initial sync on mount
    if (navigator.onLine) {
      syncNow();
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline-sync", handleOfflineSync);
    };
  }, [syncNow]);

  return { syncNow };
}
