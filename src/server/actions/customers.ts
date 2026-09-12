import { createClient } from "@/lib/supabase/client";
import { customerSchema, type CustomerInput } from "@/lib/validators/customers";

export async function getCustomers(businessId: string, search?: string) {
  const supabase = createClient();
  let query = supabase
    .from("customers")
    .select("*")
    .eq("business_id", businessId)
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (search) {
    query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function getCustomer(businessId: string, customerId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .eq("business_id", businessId)
    .eq("id", customerId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function createCustomer(businessId: string, input: CustomerInput) {
  const parsed = customerSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("customers")
    .insert({ ...parsed.data, business_id: businessId })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateCustomer(
  businessId: string,
  customerId: string,
  input: Partial<CustomerInput>
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("customers")
    .update(input)
    .eq("business_id", businessId)
    .eq("id", customerId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteCustomer(businessId: string, customerId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("customers")
    .update({ is_active: false })
    .eq("business_id", businessId)
    .eq("id", customerId);

  if (error) throw new Error(error.message);
}

export async function sendPaymentReminder(
  businessId: string,
  customerId: string,
  invoiceId: string,
  message?: string
) {
  const supabase = createClient();

  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .select("name, email")
    .eq("id", customerId)
    .eq("business_id", businessId)
    .single();

  if (customerError || !customer) throw new Error("Customer not found");
  if (!customer.email) throw new Error("Customer has no email address");

  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .select("invoice_number, total, amount_paid")
    .eq("id", invoiceId)
    .eq("business_id", businessId)
    .single();

  if (invoiceError || !invoice) throw new Error("Invoice not found");

  const { data: business } = await supabase
    .from("businesses")
    .select("name")
    .eq("id", businessId)
    .single();

  const amountDue = invoice.total - invoice.amount_paid;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const res = await fetch(`${appUrl}/api/email/send`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "payment-reminder",
      to: customer.email,
      data: {
        customerName: customer.name,
        amount: amountDue,
        invoiceNumber: invoice.invoice_number,
        businessName: business?.name || "Your Business",
      },
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to send email");
  }

  return { success: true };
}
