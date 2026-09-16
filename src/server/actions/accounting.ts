import { requireBusiness } from "@/lib/auth";

export async function getChartOfAccounts(businessId: string) {
  const auth = await requireBusiness();
  if (auth.error || !auth.supabase || !auth.businessId) return { error: auth.error };
  const supabase = auth.supabase;
  const { data, error } = await supabase
    .from("chart_of_accounts")
    .select("*")
    .eq("business_id", businessId)
    .eq("is_active", true)
    .order("account_code");
  if (error) throw new Error(error.message);
  return data;
}

export async function createAccount(businessId: string, input: {
  account_code: string;
  account_name: string;
  account_type: "asset" | "liability" | "equity" | "revenue" | "expense";
  parent_account_id?: string;
}) {
  const auth = await requireBusiness();
  if (auth.error || !auth.supabase || !auth.businessId) return { error: auth.error };
  const supabase = auth.supabase;
  const { data, error } = await supabase
    .from("chart_of_accounts")
    .insert({ ...input, business_id: businessId })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function getJournalEntries(businessId: string, status?: string) {
  const auth = await requireBusiness();
  if (auth.error || !auth.supabase || !auth.businessId) return { error: auth.error };
  const supabase = auth.supabase;
  let query = supabase
    .from("journal_entries")
    .select("*, journal_entry_lines(*)")
    .eq("business_id", businessId)
    .order("entry_date", { ascending: false });
  if (status && status !== "all") query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function getNextEntryNumber(businessId: string) {
  const auth = await requireBusiness();
  if (auth.error || !auth.supabase || !auth.businessId) return { error: auth.error };
  const suffix = crypto.randomUUID().replace(/-/g, "").substring(0, 8).toUpperCase();
  return `JE-${suffix}`;
}

export async function createJournalEntry(businessId: string, input: {
  description: string;
  entry_date?: string;
  reference_type?: string;
  reference_id?: string;
  lines: Array<{ account_name: string; account_type: "asset" | "liability" | "equity" | "revenue" | "expense"; debit?: number; credit?: number; description?: string }>;
}) {
  const auth = await requireBusiness();
  if (auth.error || !auth.supabase || !auth.businessId) return { error: auth.error };
  const supabase = auth.supabase;
  const entryNumber = await getNextEntryNumber(businessId);

  const totalDebit = input.lines.reduce((s, l) => s + (l.debit || 0), 0);
  const totalCredit = input.lines.reduce((s, l) => s + (l.credit || 0), 0);

  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    throw new Error("Debits and credits must be equal");
  }

  const { data: entry, error: eError } = await supabase
    .from("journal_entries")
    .insert({
      business_id: businessId, entry_number: entryNumber, entry_date: input.entry_date || new Date().toISOString().split("T")[0],
      description: input.description, reference_type: input.reference_type, reference_id: input.reference_id,
      total_debit: totalDebit, total_credit: totalCredit, status: "posted",
    })
    .select()
    .single();

  if (eError) throw new Error(eError.message);

  const lines = input.lines.map((l) => ({
    journal_entry_id: entry.id, account_name: l.account_name, account_type: l.account_type,
    debit: l.debit || 0, credit: l.credit || 0, description: l.description,
  }));

  const { error: lError } = await supabase.from("journal_entry_lines").insert(lines);
  if (lError) throw new Error(lError.message);

  return entry;
}

export async function generateBalanceSheet(businessId: string) {
  const auth = await requireBusiness();
  if (auth.error || !auth.supabase || !auth.businessId) return { error: auth.error };
  const supabase = auth.supabase;

  const { data: lines, error } = await supabase
    .from("journal_entry_lines")
    .select("account_name, account_type, debit, credit")
    .in("journal_entry_id",
      (await supabase.from("journal_entries").select("id").eq("business_id", businessId).eq("status", "posted")).data?.map((e) => e.id) || []
    );

  if (error) throw new Error(error.message);

  const accounts: Record<string, { name: string; type: string; balance: number }> = {};

  for (const line of lines || []) {
    const key = line.account_name;
    if (!accounts[key]) accounts[key] = { name: line.account_name, type: line.account_type, balance: 0 };

    if (line.account_type === "asset" || line.account_type === "expense") {
      accounts[key].balance += (line.debit || 0) - (line.credit || 0);
    } else {
      accounts[key].balance += (line.credit || 0) - (line.debit || 0);
    }
  }

  const assets = Object.values(accounts).filter((a) => a.type === "asset");
  const liabilities = Object.values(accounts).filter((a) => a.type === "liability");
  const equity = Object.values(accounts).filter((a) => a.type === "equity");
  const revenue = Object.values(accounts).filter((a) => a.type === "revenue");
  const expenses = Object.values(accounts).filter((a) => a.type === "expense");

  const totalAssets = assets.reduce((s, a) => s + a.balance, 0);
  const totalLiabilities = liabilities.reduce((s, a) => s + a.balance, 0);
  const totalEquity = equity.reduce((s, a) => s + a.balance, 0);
  const totalRevenue = revenue.reduce((s, a) => s + a.balance, 0);
  const totalExpenses = expenses.reduce((s, a) => s + a.balance, 0);
  const netIncome = totalRevenue - totalExpenses;

  return {
    assets, liabilities, equity, revenue, expenses,
    totalAssets, totalLiabilities, totalEquity, totalRevenue, totalExpenses, netIncome,
  };
}
