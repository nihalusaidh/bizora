import { createClient } from "@/lib/supabase/client";

export async function generateEinvoice(businessId: string, invoiceId: string, mode: "sandbox" | "production" = "sandbox") {
  const supabase = createClient();

  const { data: invoice, error: invError } = await supabase
    .from("invoices")
    .select("*, customers(name, gst_number, state, address), invoice_items(name, hsn_code, quantity, unit_price, tax_rate, tax_amount, discount_amount, total)")
    .eq("business_id", businessId)
    .eq("id", invoiceId)
    .single();

  if (invError) throw new Error("Invoice not found");

  const { data: business } = await supabase
    .from("businesses")
    .select("name, gstin, state, address")
    .eq("id", businessId)
    .single();

  if (!business?.gstin) throw new Error("GSTIN required for e-invoice");

  if (mode === "sandbox") {
    const irn = `SANDBOX-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const ackNo = `ACK${Date.now()}`;

    await supabase.from("invoices").update({
      irn, einvoice_ack_no: ackNo, einvoice_ack_date: new Date().toISOString(),
      einvoice_qr: JSON.stringify({ irn, ackNo, gstin: business.gstin, invoiceNo: invoice.invoice_number }),
    }).eq("id", invoiceId);

    await supabase.from("einvoice_log").insert({
      business_id: businessId, invoice_id: invoiceId, irn, ack_number: ackNo,
      ack_date: new Date().toISOString(), status: "generated",
      qr_code: JSON.stringify({ irn, ackNo }),
      raw_response: { mode: "sandbox", irn, ackNo },
    });

    return { irn, ack_number: ackNo, status: "generated" as const };
  }

  throw new Error("Production e-invoice requires GSTN API credentials. Configure in Settings → E-Invoice.");
}

export async function getEinvoiceLog(businessId: string, invoiceId?: string) {
  const supabase = createClient();
  let query = supabase.from("einvoice_log").select("*, invoices(invoice_number)").eq("business_id", businessId).order("created_at", { ascending: false });
  if (invoiceId) query = query.eq("invoice_id", invoiceId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function generateEwayBill(businessId: string, input: {
  invoice_id?: string;
  challan_id?: string;
  from_state: string;
  to_state: string;
  vehicle_number?: string;
  transport_mode: "road" | "rail" | "air" | "ship";
  distance_km?: number;
}) {
  const supabase = createClient();

  const ewayNumber = `EW${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const validUpto = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const { data, error } = await supabase.from("eway_bill_log").insert({
    business_id: businessId, invoice_id: input.invoice_id || null, challan_id: input.challan_id || null,
    eway_number: ewayNumber, from_state: input.from_state, to_state: input.to_state,
    vehicle_number: input.vehicle_number, transport_mode: input.transport_mode,
    distance_km: input.distance_km, status: "generated", valid_upto: validUpto.toISOString(),
    raw_response: { mode: "sandbox", ewayNumber },
  }).select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getEwayBillLog(businessId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("eway_bill_log").select("*, invoices(invoice_number)").eq("business_id", businessId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}
