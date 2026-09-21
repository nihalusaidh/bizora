"use server";

import { requireBusiness } from "@/lib/auth";

interface Gstr1B2B {
  gstin: string;
  invoice_number: string;
  invoice_date: string;
  invoice_value: number;
  place_of_supply: string;
  reverse_charge: string;
  invoice_type: string;
  items: Array<{
    hsn_code: string;
    description: string;
    uqc: string;
    quantity: number;
    taxable_value: number;
    rate: number;
    cgst: number;
    sgst: number;
    igst: number;
  }>;
}

interface Gstr1B2CSmall {
  place_of_supply: string;
  rate: number;
  taxable_value: number;
  cgst: number;
  sgst: number;
  igst: number;
}

interface HsnSummary {
  hsn_code: string;
  description: string;
  uqc: string;
  total_quantity: number;
  total_value: number;
  taxable_value: number;
  cgst: number;
  sgst: number;
  igst: number;
}

export interface Gstr1Report {
  period: string;
  generated_at: string;
  b2b: Gstr1B2B[];
  b2c_large: Gstr1B2CSmall[];
  b2c_small: Gstr1B2CSmall[];
  hsn_summary: HsnSummary[];
  document_summary: {
    total_invoices: number;
    total_taxable_value: number;
    total_cgst: number;
    total_sgst: number;
    total_igst: number;
    total_invoice_value: number;
  };
}

export async function generateGstr1(businessId: string, month: number, year: number): Promise<Gstr1Report> {
  const auth = await requireBusiness();
  if (auth.error || !auth.supabase || !auth.businessId) return { error: auth.error } as any;
  const supabase = auth.supabase;

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const { data: invoices, error: invError } = await supabase
    .from("invoices")
    .select(`
      id, invoice_number, created_at, subtotal, tax_amount, discount_amount, total, status,
      customer:customers(id, name, gst_number, state),
      items:invoice_items(name, hsn_sac, quantity, unit_price, tax_rate, tax_amount, discount_amount, total)
    `)
    .eq("business_id", auth.businessId)
    .gte("created_at", startDate.toISOString())
    .lte("created_at", endDate.toISOString())
    .in("status", ["paid", "partial", "sent"]);

  if (invError) throw new Error(invError.message);

  const { data: business, error: bizError } = await supabase
    .from("businesses")
    .select("name, gstin, state, address")
    .eq("id", auth.businessId)
    .single();

  if (bizError) throw new Error(bizError.message);

  const b2b: Gstr1B2B[] = [];
  const b2c_small: Gstr1B2CSmall[] = [];
  const hsnMap = new Map<string, HsnSummary>();

  for (const inv of invoices || []) {
    const customer = Array.isArray(inv.customer) ? inv.customer[0] : inv.customer;
    const items = Array.isArray(inv.items) ? inv.items : [];

    if (customer?.gst_number) {
      b2b.push({
        gstin: customer.gst_number,
        invoice_number: inv.invoice_number,
        invoice_date: new Date(inv.created_at).toISOString().split("T")[0],
        invoice_value: Number(inv.total),
        place_of_supply: customer.state || "01",
        reverse_charge: "N",
        invoice_type: "R",
        items: items.map((item: any) => {
          const taxable = Number(item.total) - Number(item.tax_amount || 0);
          return {
            hsn_code: item.hsn_sac || "9999",
            description: item.name,
            uqc: "NOS",
            quantity: Number(item.quantity),
            taxable_value: taxable,
            rate: Number(item.tax_rate || 0),
            cgst: Number(item.tax_amount || 0) / 2,
            sgst: Number(item.tax_amount || 0) / 2,
            igst: 0,
          };
        }),
      });
    } else {
      const totalTaxable = items.reduce(
        (sum: number, item: any) => sum + (Number(item.total) - Number(item.tax_amount || 0)),
        0
      );
      const totalTax = items.reduce((sum: number, item: any) => sum + Number(item.tax_amount || 0), 0);
      const rate = items.length > 0 ? Number(items[0].tax_rate || 0) : 0;

      const existing = b2c_small.find((b) => b.rate === rate);
      if (existing) {
        existing.taxable_value += totalTaxable;
        existing.cgst += totalTax / 2;
        existing.sgst += totalTax / 2;
      } else {
        b2c_small.push({
          place_of_supply: customer?.state || business?.state || "01",
          rate,
          taxable_value: totalTaxable,
          cgst: totalTax / 2,
          sgst: totalTax / 2,
          igst: 0,
        });
      }
    }

    for (const item of items) {
      const hsn = item.hsn_sac || "9999";
      const existing = hsnMap.get(hsn);
      const taxable = Number(item.total) - Number(item.tax_amount || 0);
      const tax = Number(item.tax_amount || 0);
      if (existing) {
        existing.total_quantity += Number(item.quantity);
        existing.total_value += Number(item.total);
        existing.taxable_value += taxable;
        existing.cgst += tax / 2;
        existing.sgst += tax / 2;
      } else {
        hsnMap.set(hsn, {
          hsn_code: hsn,
          description: item.name,
          uqc: "NOS",
          total_quantity: Number(item.quantity),
          total_value: Number(item.total),
          taxable_value: taxable,
          cgst: tax / 2,
          sgst: tax / 2,
          igst: 0,
        });
      }
    }
  }

  const hsn_summary = Array.from(hsnMap.values());
  const totalTaxable =
    b2b.reduce((s, i) => s + i.items.reduce((a, b) => a + b.taxable_value, 0), 0) +
    b2c_small.reduce((s, i) => s + i.taxable_value, 0);
  const totalCgst =
    b2b.reduce((s, i) => s + i.items.reduce((a, b) => a + b.cgst, 0), 0) +
    b2c_small.reduce((s, i) => s + i.cgst, 0);
  const totalSgst = totalCgst;

  return {
    period: `${String(month).padStart(2, "0")}-${year}`,
    generated_at: new Date().toISOString(),
    b2b,
    b2c_large: [],
    b2c_small,
    hsn_summary,
    document_summary: {
      total_invoices: (invoices || []).length,
      total_taxable_value: totalTaxable,
      total_cgst: totalCgst,
      total_sgst: totalSgst,
      total_igst: 0,
      total_invoice_value: (invoices || []).reduce((s, i) => s + Number(i.total), 0),
    },
  };
}

export interface Gstr3bSummary {
  period: string;
  outward_taxable: number;
  outward_cgst: number;
  outward_sgst: number;
  outward_igst: number;
  outward_count: number;
  itc_cgst: number;
  itc_sgst: number;
  itc_igst: number;
  itc_count: number;
  net_cgst: number;
  net_sgst: number;
}

/**
 * GSTR-3B ready reckoner (not a filing): outward tax from sales invoices,
 * ITC estimate from received purchase orders in the same month.
 */
export async function generateGstr3b(businessId: string, month: number, year: number): Promise<Gstr3bSummary> {
  const auth = await requireBusiness();
  if (auth.error || !auth.supabase || !auth.businessId) throw new Error(auth.error || "Not authenticated");
  const supabase = auth.supabase;

  const startIso = new Date(year, month - 1, 1).toISOString();
  const endIso = new Date(year, month, 0, 23, 59, 59).toISOString();

  const [{ data: invoices }, { data: purchases }] = await Promise.all([
    supabase
      .from("invoices")
      .select("total, tax_amount")
      .eq("business_id", auth.businessId)
      .gte("created_at", startIso)
      .lte("created_at", endIso)
      .in("status", ["paid", "partial", "sent"]),
    supabase
      .from("purchase_orders")
      .select("tax_amount, received_date, created_at")
      .eq("business_id", auth.businessId)
      .eq("status", "received"),
  ]);

  let outwardTaxable = 0;
  let outwardTax = 0;
  for (const inv of invoices || []) {
    const tax = Number(inv.tax_amount) || 0;
    outwardTax += tax;
    outwardTaxable += (Number(inv.total) || 0) - tax;
  }

  let itcTax = 0;
  let itcCount = 0;
  for (const po of purchases || []) {
    const dt = (po.received_date as string) || (po.created_at as string);
    if (!dt) continue;
    const d = new Date(dt);
    if (d.getFullYear() === year && d.getMonth() === month - 1) {
      itcTax += Number(po.tax_amount) || 0;
      itcCount += 1;
    }
  }

  const outwardCgst = outwardTax / 2;
  const itcCgst = itcTax / 2;
  return {
    period: `${String(month).padStart(2, "0")}-${year}`,
    outward_taxable: outwardTaxable,
    outward_cgst: outwardCgst,
    outward_sgst: outwardCgst,
    outward_igst: 0,
    outward_count: (invoices || []).length,
    itc_cgst: itcCgst,
    itc_sgst: itcCgst,
    itc_igst: 0,
    itc_count: itcCount,
    net_cgst: Math.max(0, outwardCgst - itcCgst),
    net_sgst: Math.max(0, outwardCgst - itcCgst),
  };
}
