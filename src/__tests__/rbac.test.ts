import { hasPermission, hasAnyPermission, getRolePermissions, ROLE_PERMISSIONS } from "@/lib/rbac";
import type { UserRole } from "@/types/database";

describe("RBAC utilities", () => {
  describe("hasPermission", () => {
    it("returns true for owner with any permission", () => {
      expect(hasPermission("owner", "billing:read")).toBe(true);
      expect(hasPermission("owner", "billing:write")).toBe(true);
      expect(hasPermission("owner", "team:invite")).toBe(true);
      expect(hasPermission("owner", "team:remove")).toBe(true);
    });

    it("returns correct permissions for cashier", () => {
      expect(hasPermission("cashier", "billing:read")).toBe(true);
      expect(hasPermission("cashier", "billing:write")).toBe(true);
      expect(hasPermission("cashier", "billing:delete")).toBe(false);
      expect(hasPermission("cashier", "inventory:write")).toBe(false);
    });

    it("returns correct permissions for inventory_staff", () => {
      expect(hasPermission("inventory_staff", "inventory:read")).toBe(true);
      expect(hasPermission("inventory_staff", "inventory:write")).toBe(true);
      expect(hasPermission("inventory_staff", "billing:read")).toBe(false);
    });

    it("returns correct permissions for accountant", () => {
      expect(hasPermission("accountant", "expenses:read")).toBe(true);
      expect(hasPermission("accountant", "expenses:write")).toBe(true);
      expect(hasPermission("accountant", "expenses:delete")).toBe(true);
      expect(hasPermission("accountant", "reports:read")).toBe(true);
      expect(hasPermission("accountant", "billing:write")).toBe(false);
    });

    it("returns false for non-existent permission", () => {
      expect(hasPermission("cashier", "nonexistent:permission")).toBe(false);
    });
  });

  describe("hasAnyPermission", () => {
    it("returns true if role has at least one permission", () => {
      expect(hasAnyPermission("cashier", ["billing:read", "inventory:write"])).toBe(true);
    });

    it("returns false if role has none of the permissions", () => {
      expect(hasAnyPermission("cashier", ["inventory:write", "team:invite"])).toBe(false);
    });
  });

  describe("getRolePermissions", () => {
    it("returns all permissions for owner", () => {
      const perms = getRolePermissions("owner");
      expect(perms.length).toBeGreaterThan(20);
      expect(perms).toContain("team:invite");
      expect(perms).toContain("team:remove");
    });

    it("returns limited permissions for cashier", () => {
      const perms = getRolePermissions("cashier");
      expect(perms.length).toBeLessThan(10);
    });

    it("returns empty array for unknown role", () => {
      expect(getRolePermissions("unknown" as UserRole)).toEqual([]);
    });
  });

  describe("ROLE_PERMISSIONS", () => {
    it("has all 5 roles defined", () => {
      expect(Object.keys(ROLE_PERMISSIONS)).toHaveLength(5);
      expect(ROLE_PERMISSIONS).toHaveProperty("owner");
      expect(ROLE_PERMISSIONS).toHaveProperty("manager");
      expect(ROLE_PERMISSIONS).toHaveProperty("cashier");
      expect(ROLE_PERMISSIONS).toHaveProperty("inventory_staff");
      expect(ROLE_PERMISSIONS).toHaveProperty("accountant");
    });

    it("owner has more permissions than manager", () => {
      expect(ROLE_PERMISSIONS.owner.length).toBeGreaterThan(
        ROLE_PERMISSIONS.manager.length
      );
    });
  });
});
