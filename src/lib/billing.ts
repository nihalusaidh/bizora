export interface CartItem {
  productId: string | null;
  variantId: string | null;
  name: string;
  sku: string | null;
  quantity: number;
  unit: string;
  unitPrice: number;
  costPrice: number | null;
  discountPercent: number;
  taxRate: number;
  stockQuantity: number;
}

export function calculateItemTotal(item: CartItem) {
  const base = item.unitPrice * item.quantity;
  const discountAmt = base * (item.discountPercent / 100);
  const taxableAmount = base - discountAmt;
  const taxAmt = taxableAmount * (item.taxRate / 100);
  const total = taxableAmount + taxAmt;
  return { base, discountAmt, taxAmt, total };
}

export function calculateInvoiceTotals(
  items: CartItem[],
  globalDiscountPercent: number = 0,
  globalDiscountAmount: number = 0
) {
  let subtotal = 0;
  let totalTax = 0;
  let totalDiscount = 0;

  for (const item of items) {
    const { base, discountAmt, taxAmt, total } = calculateItemTotal(item);
    subtotal += base;
    totalTax += taxAmt;
    totalDiscount += discountAmt;
  }

  // Apply global discount
  let globalDiscount = globalDiscountAmount;
  if (globalDiscountPercent > 0) {
    globalDiscount = subtotal * (globalDiscountPercent / 100);
  }
  totalDiscount += globalDiscount;

  const afterDiscount = subtotal - totalDiscount;
  const grandTotal = afterDiscount + totalTax;
  const roundOff = Math.round(grandTotal) - grandTotal;
  const finalTotal = Math.round(grandTotal);

  return {
    subtotal,
    totalDiscount,
    totalTax,
    roundOff,
    grandTotal: finalTotal,
  };
}
