import { createClient } from "@/lib/supabase/client";

export async function getDeliveryChallans(businessId: string, status?: string) {
  const supabase = createClient();
  let query = supabase
    .from("delivery_challans")
    .select("*, customers(name, phone), invoices(invoice_number)")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function getDeliveryChallan(businessId: string, challanId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("delivery_challans")
    .select("*, customers(name, phone, email, address), invoices(invoice_number, total, invoice_items(*)), delivery_challan_items(*)")
    .eq("business_id", businessId)
    .eq("id", challanId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getNextChallanNumber(businessId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("delivery_challans")
    .select("challan_number")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") throw new Error(error.message);
  if (!data) return "DC-0001";

  const lastNum = parseInt(data.challan_number.split("-")[1] || "0", 10);
  return `DC-${String(lastNum + 1).padStart(4, "0")}`;
}

export async function createDeliveryChallan(businessId: string, input: {
  invoice_id?: string | null;
  customer_id?: string | null;
  items: Array<{ product_id?: string | null; name: string; quantity: number; unit?: string; batch_number?: string | null }>;
  dispatch_date?: string;
  expected_return_date?: string | null;
  vehicle_number?: string | null;
  driver_name?: string | null;
  driver_phone?: string | null;
  notes?: string | null;
}) {
  const supabase = createClient();
  const challanNumber = await getNextChallanNumber(businessId);

  const { data: challan, error: cError } = await supabase
    .from("delivery_challans")
    .insert({
      business_id: businessId,
      challan_number: challanNumber,
      invoice_id: input.invoice_id || null,
      customer_id: input.customer_id || null,
      status: "pending",
      dispatch_date: input.dispatch_date || new Date().toISOString().split("T")[0],
      expected_return_date: input.expected_return_date || null,
      vehicle_number: input.vehicle_number,
      driver_name: input.driver_name,
      driver_phone: input.driver_phone,
      notes: input.notes,
    })
    .select()
    .single();

  if (cError) throw new Error(cError.message);

  const challanItems = input.items.map((item) => ({
    challan_id: challan.id,
    product_id: item.product_id || null,
    name: item.name,
    quantity: item.quantity,
    unit: item.unit || "pcs",
    batch_number: item.batch_number || null,
  }));

  const { error: iError } = await supabase.from("delivery_challan_items").insert(challanItems);
  if (iError) throw new Error(iError.message);

  return challan;
}

export async function updateChallanStatus(businessId: string, challanId: string, status: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("delivery_challans")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("business_id", businessId)
    .eq("id", challanId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteDeliveryChallan(businessId: string, challanId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("delivery_challans")
    .delete()
    .eq("business_id", businessId)
    .eq("id", challanId);

  if (error) throw new Error(error.message);
}
