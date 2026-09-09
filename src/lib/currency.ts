import type { Business } from "@/types/database";

export function formatCurrency(
  amount: number,
  currency?: string | null,
  currencySymbol?: string | null
): string {
  const symbol = currencySymbol || "₹";
  const code = currency || "INR";

  if (amount >= 10000000) {
    return `${symbol}${(amount / 10000000).toFixed(2)}Cr`;
  }
  if (amount >= 100000) {
    return `${symbol}${(amount / 100000).toFixed(2)}L`;
  }
  if (amount >= 1000) {
    return `${symbol}${(amount / 1000).toFixed(1)}K`;
  }
  return `${symbol}${amount.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function formatCurrencyFull(
  amount: number,
  currency?: string | null,
  currencySymbol?: string | null
): string {
  const symbol = currencySymbol || "₹";
  return `${symbol}${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatCurrencyCompact(
  amount: number,
  business?: Business | null
): string {
  return formatCurrency(amount, business?.currency, business?.currency_symbol);
}

export function formatCurrencyFullCompact(
  amount: number,
  business?: Business | null
): string {
  return formatCurrencyFull(amount, business?.currency, business?.currency_symbol);
}
