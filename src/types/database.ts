export type BusinessType =
  | "grocery"
  | "clothing"
  | "electronics"
  | "mobile"
  | "cosmetics"
  | "bakery"
  | "hardware"
  | "furniture"
  | "wholesale"
  | "service"
  | "other";

export type BusinessSize = "solo" | "small" | "medium" | "large";

export type GstStatus = "registered" | "unregistered";

export type PlanTier = "free" | "gold" | "diamond";

export type UserRole = "owner" | "manager" | "cashier" | "inventory_staff" | "accountant";

export interface Business {
  id: string;
  name: string;
  type: BusinessType;
  currency: string;
  currency_symbol: string;
  gst_status: GstStatus;
  gstin?: string;
  size: BusinessSize;
  logo_url?: string;
  address?: string;
  phone?: string;
  email?: string;
  state?: string;
  upi_id?: string;
  terms_conditions?: string;
  bank_name?: string;
  bank_account?: string;
  bank_ifsc?: string;
  bank_upi?: string;
  plan?: PlanTier;
  subscription_status?: string;
  razorpay_subscription_id?: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface Membership {
  user_id: string;
  business_id: string;
  role: UserRole;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
}

export interface OnboardingData {
  business_type?: BusinessType;
  business_name?: string;
  currency?: string;
  currency_symbol?: string;
  gst_status?: GstStatus;
  business_size?: BusinessSize;
}

export interface Customer {
  id: string;
  business_id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  gst_number?: string | null;
  outstanding_balance: number;
  total_spend: number;
  purchase_count: number;
  last_purchase_at?: string | null;
  preferred_delivery: "whatsapp" | "print" | "both" | "ask";
  notes?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomerPayment {
  id: string;
  customer_id: string;
  business_id: string;
  amount: number;
  payment_method: "cash" | "upi" | "card" | "bank_transfer" | "other";
  reference?: string | null;
  notes?: string | null;
  created_at: string;
}

export interface CustomerCredit {
  id: string;
  customer_id: string;
  business_id: string;
  amount: number;
  type: "debit" | "credit";
  description?: string | null;
  due_date?: string | null;
  status: "pending" | "paid" | "overdue" | "cancelled";
  reference_id?: string | null;
  reference_type?: string | null;
  created_at: string;
}

export interface Invoice {
  id: string;
  business_id: string;
  invoice_number: string;
  customer_id?: string | null;
  status: "draft" | "sent" | "paid" | "partial" | "cancelled" | "returned";
  subtotal: number;
  discount_amount: number;
  discount_percent: number;
  tax_amount: number;
  round_off: number;
  total: number;
  amount_paid: number;
  payment_method?: string | null;
  delivery_method: "whatsapp" | "print" | "both" | "ask";
  delivery_status: "pending" | "sent" | "delivered";
  notes?: string | null;
  terms?: string | null;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  product_id?: string | null;
  variant_id?: string | null;
  name: string;
  sku?: string | null;
  quantity: number;
  unit: string;
  unit_price: number;
  cost_price?: number | null;
  discount_percent: number;
  discount_amount: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  created_at: string;
}

export interface ExpenseCategory {
  id: string;
  business_id: string;
  name: string;
  icon?: string | null;
  color?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  business_id: string;
  category_id?: string | null;
  description: string;
  amount: number;
  payment_method: "cash" | "upi" | "card" | "bank_transfer" | "other";
  vendor?: string | null;
  reference?: string | null;
  expense_date: string;
  receipt_url?: string | null;
  notes?: string | null;
  is_recurring: boolean;
  recurring_period?: "daily" | "weekly" | "monthly" | "yearly" | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrder {
  id: string;
  business_id: string;
  supplier_id: string;
  po_number: string;
  status: "draft" | "ordered" | "partial" | "received" | "cancelled";
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  amount_paid: number;
  expected_date?: string | null;
  received_date?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrderItem {
  id: string;
  purchase_order_id: string;
  product_id?: string | null;
  name: string;
  sku?: string | null;
  ordered_quantity: number;
  received_quantity: number;
  unit: string;
  unit_cost: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  created_at: string;
}

export type EstimateStatus = "draft" | "sent" | "accepted" | "rejected" | "expired" | "converted";

export interface Estimate {
  id: string;
  business_id: string;
  estimate_number: string;
  customer_id?: string | null;
  status: EstimateStatus;
  subtotal: number;
  discount_amount: number;
  discount_percent: number;
  tax_amount: number;
  total: number;
  valid_until?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface EstimateItem {
  id: string;
  estimate_id: string;
  product_id?: string | null;
  variant_id?: string | null;
  name: string;
  sku?: string | null;
  quantity: number;
  unit: string;
  unit_price: number;
  discount_percent: number;
  discount_amount: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  created_at: string;
}

export type JournalStatus = "draft" | "posted" | "reversed";

export interface JournalEntry {
  id: string;
  business_id: string;
  entry_number: string;
  entry_date: string;
  description: string;
  reference_type?: string | null;
  reference_id?: string | null;
  total_debit: number;
  total_credit: number;
  status: JournalStatus;
  created_at: string;
}

export interface JournalEntryLine {
  id: string;
  journal_entry_id: string;
  account_name: string;
  account_type: "asset" | "liability" | "equity" | "revenue" | "expense";
  debit: number;
  credit: number;
  description?: string | null;
  created_at: string;
}

export type SalesOrderStatus = "pending" | "confirmed" | "processing" | "dispatched" | "delivered" | "cancelled";

export interface SalesOrder {
  id: string;
  business_id: string;
  order_number: string;
  customer_id?: string | null;
  status: SalesOrderStatus;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  expected_date?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SalesOrderItem {
  id: string;
  sales_order_id: string;
  product_id?: string | null;
  variant_id?: string | null;
  name: string;
  sku?: string | null;
  quantity: number;
  unit: string;
  unit_price: number;
  discount_percent: number;
  tax_rate: number;
  total: number;
  created_at: string;
}

export type ChallanStatus = "pending" | "dispatched" | "delivered" | "returned";

export interface DeliveryChallan {
  id: string;
  business_id: string;
  challan_number: string;
  invoice_id?: string | null;
  customer_id?: string | null;
  status: ChallanStatus;
  dispatch_date: string;
  expected_return_date?: string | null;
  vehicle_number?: string | null;
  driver_name?: string | null;
  driver_phone?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DeliveryChallanItem {
  id: string;
  challan_id: string;
  product_id?: string | null;
  name: string;
  quantity: number;
  unit: string;
  batch_number?: string | null;
  created_at: string;
}

export type EinvoiceStatus = "pending" | "generated" | "cancelled" | "failed";

export interface EinvoiceLog {
  id: string;
  business_id: string;
  invoice_id: string;
  irn?: string | null;
  ack_number?: string | null;
  ack_date?: string | null;
  qr_code?: string | null;
  status: EinvoiceStatus;
  raw_response?: Record<string, unknown> | null;
  created_at: string;
}

export type EwayBillStatus = "pending" | "generated" | "cancelled" | "expired";
export type TransportMode = "road" | "rail" | "air" | "ship";

export interface EwayBillLog {
  id: string;
  business_id: string;
  invoice_id?: string | null;
  challan_id?: string | null;
  eway_number?: string | null;
  from_state?: string | null;
  to_state?: string | null;
  vehicle_number?: string | null;
  transport_mode?: TransportMode | null;
  distance_km?: number | null;
  status: EwayBillStatus;
  valid_upto?: string | null;
  raw_response?: Record<string, unknown> | null;
  created_at: string;
}

export interface BarcodeLabelConfig {
  id: string;
  business_id: string;
  paper_size: string;
  show_name: boolean;
  show_price: boolean;
  show_barcode: boolean;
  show_sku: boolean;
  show_mrp: boolean;
  copies_per_label: number;
  created_at: string;
  updated_at: string;
}
