import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

type TableName = "invoices" | "products" | "customers" | "expenses" | "notifications";

interface RealtimeOptions {
  businessId: string;
  table: TableName;
  event?: "INSERT" | "UPDATE" | "DELETE" | "*";
  filter?: string;
  callback: (payload: any) => void;
}

export function subscribeToTable({
  businessId,
  table,
  event = "*",
  callback,
}: RealtimeOptions): () => void {
  const supabase = createClient();

  const channel: RealtimeChannel = supabase
    .channel(`realtime:${table}:${businessId}`)
    .on(
      "postgres_changes" as any,
      {
        event,
        schema: "public",
        table,
        filter: `business_id=eq.${businessId}`,
      },
      callback
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToInvoiceChanges(
  businessId: string,
  callback: (invoice: any) => void
): () => void {
  return subscribeToTable({
    businessId,
    table: "invoices",
    event: "*",
    callback: (payload) => {
      callback(payload);
    },
  });
}

export function subscribeToProductChanges(
  businessId: string,
  callback: (product: any) => void
): () => void {
  return subscribeToTable({
    businessId,
    table: "products",
    event: "*",
    callback: (payload) => {
      callback(payload);
    },
  });
}
