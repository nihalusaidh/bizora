export type BusinessType =
  | "retail"
  | "grocery"
  | "clothing"
  | "electronics"
  | "wholesale"
  | "distribution"
  | "service"
  | "restaurant"
  | "other";

export interface BusinessTypeConfig {
  label: string;
  icon: string;
  primaryMetric: string;
  secondaryMetric: string;
  dashboardEmphasis: string[];
  navPriority: string[];
  features: string[];
}

export const businessTypeConfigs: Record<BusinessType, BusinessTypeConfig> = {
  retail: {
    label: "Retail",
    icon: "🛒",
    primaryMetric: "Today's Sales",
    secondaryMetric: "Inventory Value",
    dashboardEmphasis: ["sales", "inventory", "customers"],
    navPriority: ["dashboard", "billing", "inventory", "customers", "insights"],
    features: [
      "barcode scanning",
      "stock alerts",
      "quick billing",
      "sales tracking",
      "customer loyalty",
    ],
  },
  grocery: {
    label: "Grocery",
    icon: "🥬",
    primaryMetric: "Today's Sales",
    secondaryMetric: "Low Stock Items",
    dashboardEmphasis: ["sales", "inventory", "suppliers"],
    navPriority: ["dashboard", "billing", "inventory", "suppliers", "insights"],
    features: [
      "barcode scanning",
      "expiry tracking",
      "bulk items",
      "weight-based pricing",
      "stock alerts",
    ],
  },
  clothing: {
    label: "Clothing",
    icon: "👕",
    primaryMetric: "Today's Sales",
    secondaryMetric: "Top Selling Category",
    dashboardEmphasis: ["sales", "inventory", "customers"],
    navPriority: ["dashboard", "billing", "inventory", "customers", "insights"],
    features: [
      "size variants",
      "seasonal tracking",
      "barcode scanning",
      "style catalog",
      "stock alerts",
    ],
  },
  electronics: {
    label: "Electronics",
    icon: "📱",
    primaryMetric: "Today's Sales",
    secondaryMetric: "Warranty Items",
    dashboardEmphasis: ["sales", "inventory", "customers"],
    navPriority: ["dashboard", "billing", "inventory", "customers", "insights"],
    features: [
      "serial number tracking",
      "warranty management",
      "barcode scanning",
      "AMC tracking",
      "stock alerts",
    ],
  },
  wholesale: {
    label: "Wholesale",
    icon: "📦",
    primaryMetric: "Today's Orders",
    secondaryMetric: "Outstanding Dues",
    dashboardEmphasis: ["sales", "customers", "inventory"],
    navPriority: ["dashboard", "billing", "customers", "inventory", "insights"],
    features: [
      "bulk billing",
      "credit management",
      "party ledger",
      "volume discounts",
      "order tracking",
    ],
  },
  distribution: {
    label: "Distribution",
    icon: "🚚",
    primaryMetric: "Today's Revenue",
    secondaryMetric: "Pending Deliveries",
    dashboardEmphasis: ["sales", "customers", "suppliers"],
    navPriority: ["dashboard", "billing", "customers", "suppliers", "insights"],
    features: [
      "route planning",
      "delivery tracking",
      "credit management",
      "stock alerts",
      "party ledger",
    ],
  },
  service: {
    label: "Service",
    icon: "💼",
    primaryMetric: "Today's Revenue",
    secondaryMetric: "Pending Invoices",
    dashboardEmphasis: ["sales", "customers", "expenses"],
    navPriority: ["dashboard", "billing", "customers", "expenses", "insights"],
    features: [
      "appointments",
      "service history",
      "recurring billing",
      "time tracking",
      "quotations",
    ],
  },
  restaurant: {
    label: "Restaurant",
    icon: "🍽️",
    primaryMetric: "Today's Orders",
    secondaryMetric: "Top Selling Item",
    dashboardEmphasis: ["sales", "inventory", "expenses"],
    navPriority: ["dashboard", "billing", "inventory", "expenses", "insights"],
    features: [
      "menu management",
      "table orders",
      "KOT printing",
      "recipe costing",
      "stock alerts",
    ],
  },
  other: {
    label: "Other",
    icon: "🏪",
    primaryMetric: "Today's Sales",
    secondaryMetric: "Outstanding Dues",
    dashboardEmphasis: ["sales", "inventory", "customers"],
    navPriority: ["dashboard", "billing", "inventory", "customers", "insights"],
    features: [
      "quick billing",
      "inventory tracking",
      "customer management",
      "expense tracking",
      "basic reports",
    ],
  },
};
