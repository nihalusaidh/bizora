export const APP_NAME = "BIZORA";
export const APP_DESCRIPTION = "AI Business Operating System for Small & Medium Businesses";

export const BUSINESS_TYPES = [
  { value: "grocery", label: "Grocery", icon: "🛒" },
  { value: "clothing", label: "Clothing", icon: "👕" },
  { value: "electronics", label: "Electronics", icon: "📱" },
  { value: "mobile", label: "Mobile Shop", icon: "📱" },
  { value: "cosmetics", label: "Cosmetics", icon: "💄" },
  { value: "bakery", label: "Bakery", icon: "🍞" },
  { value: "hardware", label: "Hardware", icon: "🔧" },
  { value: "furniture", label: "Furniture", icon: "🪑" },
  { value: "wholesale", label: "Wholesale", icon: "📦" },
  { value: "service", label: "Service", icon: "💼" },
  { value: "other", label: "Other", icon: "🏪" },
] as const;

export const CURRENCIES = [
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
  { code: "SAR", symbol: "﷼", name: "Saudi Riyal" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
] as const;

export const GST_STATUS = [
  { value: "registered", label: "GST Registered", description: "Your business has a GSTIN" },
  { value: "unregistered", label: "Unregistered", description: "Your business does not have GST" },
] as const;

export const BUSINESS_SIZES = [
  { value: "solo", label: "Just me", description: "1 person" },
  { value: "small", label: "Small team", description: "2-5 people" },
  { value: "medium", label: "Medium team", description: "6-20 people" },
  { value: "large", label: "Large team", description: "20+ people" },
] as const;

export const BUSINESS_ROLES = {
  owner: "Owner",
  manager: "Manager",
  cashier: "Cashier",
  inventory_staff: "Inventory Staff",
  accountant: "Accountant",
} as const;

export const PLAN_FEATURES = {
  free: [
    "basic_billing",
    "basic_inventory",
    "basic_customers",
    "basic_suppliers",
    "basic_expenses",
    "basic_reports",
    "barcode",
    "whatsapp_invoice",
    "digital_khata",
    "basic_loyalty",
    "basic_online_catalogue",
    "cloud_backup",
  ],
  pro: [
    "ai_copilot",
    "business_health",
    "ai_morning_brief",
    "profit_leak_detector",
    "advanced_analytics",
    "stock_forecasting",
    "customer_intelligence",
    "churn_radar",
    "ai_marketing",
    "advanced_reports",
    "cash_flow_forecasting",
    "smart_bundles",
    "advanced_supplier_intelligence",
    "business_recommendations",
  ],
  advanced: [
    "business_simulator",
    "business_twin",
    "missed_revenue_engine",
    "opportunity_radar",
    "advanced_forecasting",
    "business_automation",
    "advanced_multi_branch",
    "advanced_staff_controls",
    "autonomous_workflows",
  ],
} as const;

export const PLAN_LIMITS = {
  free: { products: 500, customers: 500, staff: 2, branches: 1 },
  pro: { products: 10000, customers: 10000, staff: 10, branches: 3 },
  advanced: { products: Infinity, customers: Infinity, staff: Infinity, branches: Infinity },
} as const;

export const PLAN_PRICING = {
  free: { monthly: 0, yearly: 0 },
  pro: { monthly: 399, yearly: 3990 },
  advanced: { monthly: 999, yearly: 9990 },
} as const;

export const EXPENSE_CATEGORIES_DEFAULTS = [
  { name: "Rent", icon: "🏠", color: "#3b82f6" },
  { name: "Utilities", icon: "💡", color: "#eab308" },
  { name: "Salaries", icon: "👤", color: "#22c55e" },
  { name: "Inventory Purchase", icon: "📦", color: "#8b5cf6" },
  { name: "Marketing", icon: "📢", color: "#f97316" },
  { name: "Transport", icon: "🚚", color: "#06b6d4" },
  { name: "Office Supplies", icon: "📎", color: "#64748b" },
  { name: "Maintenance", icon: "🔧", color: "#ec4899" },
  { name: "Insurance", icon: "🛡️", color: "#14b8a6" },
  { name: "Other", icon: "📋", color: "#6b7280" },
] as const;
