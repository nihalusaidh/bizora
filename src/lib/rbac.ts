import type { UserRole } from "@/types/database";

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  owner: [
    "billing:read", "billing:write", "billing:delete",
    "inventory:read", "inventory:write", "inventory:delete",
    "customers:read", "customers:write", "customers:delete",
    "suppliers:read", "suppliers:write", "suppliers:delete",
    "expenses:read", "expenses:write", "expenses:delete",
    "reports:read",
    "team:read", "team:invite", "team:remove", "team:change_role",
    "settings:read", "settings:write",
    "khata:read", "khata:write",
  ],
  manager: [
    "billing:read", "billing:write", "billing:delete",
    "inventory:read", "inventory:write", "inventory:delete",
    "customers:read", "customers:write", "customers:delete",
    "suppliers:read", "suppliers:write", "suppliers:delete",
    "expenses:read", "expenses:write", "expenses:delete",
    "reports:read",
    "team:read",
    "settings:read",
    "khata:read", "khata:write",
  ],
  cashier: [
    "billing:read", "billing:write",
    "inventory:read",
    "customers:read", "customers:write",
    "khata:read",
  ],
  inventory_staff: [
    "inventory:read", "inventory:write",
    "suppliers:read",
    "customers:read",
  ],
  accountant: [
    "billing:read",
    "inventory:read",
    "customers:read",
    "expenses:read", "expenses:write", "expenses:delete",
    "reports:read",
    "khata:read", "khata:write",
  ],
};

export function hasPermission(role: UserRole, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function hasAnyPermission(role: UserRole, permissions: string[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

export function getRolePermissions(role: UserRole): string[] {
  return ROLE_PERMISSIONS[role] || [];
}

export const ROLE_DESCRIPTIONS: Record<UserRole, { label: string; description: string }> = {
  owner: {
    label: "Owner",
    description: "Full access to everything including team management",
  },
  manager: {
    label: "Manager",
    description: "Can manage billing, inventory, customers, and expenses",
  },
  cashier: {
    label: "Cashier",
    description: "Can create bills and view customers and inventory",
  },
  inventory_staff: {
    label: "Inventory Staff",
    description: "Can manage products and view suppliers",
  },
  accountant: {
    label: "Accountant",
    description: "Can manage expenses, view billing, and run reports",
  },
};
