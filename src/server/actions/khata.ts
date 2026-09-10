import { createClient } from "@/lib/supabase/client";
import {
  customerPaymentSchema,
  customerCreditSchema,
  type CustomerPaymentInput,
  type CustomerCreditInput,
} from "@/lib/validators/customers";

export async function getCustomerPayments(customerId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("customer_payments")
    .select("*")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function addCustomerPayment(
  businessId: string,
  customerId: string,
  input: CustomerPaymentInput
) {
  const parsed = customerPaymentSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  const supabase = createClient();

  const { error: paymentError } = await supabase.from("customer_payments").insert({
    ...parsed.data,
    customer_id: customerId,
    business_id: businessId,
  });

  if (paymentError) throw new Error(paymentError.message);

  const { data: customer, error: fetchError } = await supabase
    .from("customers")
    .select("outstanding_balance")
    .eq("id", customerId)
    .single();

  if (fetchError) throw new Error(fetchError.message);

  const newBalance = Math.max(0, (customer.outstanding_balance || 0) - parsed.data.amount);

  const { error: updateError } = await supabase
    .from("customers")
    .update({ outstanding_balance: newBalance })
    .eq("id", customerId);

  if (updateError) throw new Error(updateError.message);

  return { success: true };
}

export async function getCustomerCredit(businessId: string, customerId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("customer_credit")
    .select("*")
    .eq("business_id", businessId)
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function addCustomerCredit(
  businessId: string,
  customerId: string,
  input: CustomerCreditInput
) {
  const parsed = customerCreditSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0].message);
  }

  const supabase = createClient();

  const { error: creditError } = await supabase.from("customer_credit").insert({
    amount: parsed.data.amount,
    description: parsed.data.description,
    due_date: parsed.data.due_date || null,
    type: "credit",
    status: "pending",
    customer_id: customerId,
    business_id: businessId,
  });

  if (creditError) throw new Error(creditError.message);

  const { data: customer, error: fetchError } = await supabase
    .from("customers")
    .select("outstanding_balance")
    .eq("id", customerId)
    .single();

  if (fetchError) throw new Error(fetchError.message);

  const newBalance = (customer.outstanding_balance || 0) + parsed.data.amount;

  const { error: updateError } = await supabase
    .from("customers")
    .update({ outstanding_balance: newBalance })
    .eq("id", customerId);

  if (updateError) throw new Error(updateError.message);

  return { success: true };
}

export async function markCreditPaid(
  businessId: string,
  creditId: string,
  customerId: string,
  amount: number
) {
  const supabase = createClient();

  const { error: creditError } = await supabase
    .from("customer_credit")
    .update({ status: "paid" })
    .eq("business_id", businessId)
    .eq("id", creditId);

  if (creditError) throw new Error(creditError.message);

  const { data: customer, error: fetchError } = await supabase
    .from("customers")
    .select("outstanding_balance")
    .eq("id", customerId)
    .single();

  if (fetchError) throw new Error(fetchError.message);

  const newBalance = Math.max(0, (customer.outstanding_balance || 0) - amount);

  const { error: updateError } = await supabase
    .from("customers")
    .update({ outstanding_balance: newBalance })
    .eq("id", customerId);

  if (updateError) throw new Error(updateError.message);

  return { success: true };
}
