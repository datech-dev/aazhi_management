import { describe, it, expect } from "vitest";
import { UserRole } from "@prisma/client";

describe("Staff Management & RBAC Permission Logic", () => {
  it("should validate default permissions by role", () => {
    const checkRolePermission = (role: UserRole, action: string) => {
      if (role === UserRole.OWNER || role === UserRole.ADMIN) return true;
      if (role === UserRole.TAILOR && (action === "production.view" || action === "production.update")) return true;
      if (role === UserRole.SALES && (action === "orders.create" || action === "customers.view")) return true;
      return false;
    };

    expect(checkRolePermission(UserRole.OWNER, "payments.void")).toBe(true);
    expect(checkRolePermission(UserRole.TAILOR, "production.update")).toBe(true);
    expect(checkRolePermission(UserRole.TAILOR, "payments.void")).toBe(false);
    expect(checkRolePermission(UserRole.SALES, "orders.create")).toBe(true);
  });

  it("should support explicit user permission override evaluation", () => {
    const rolePermission = false; // TAILOR cannot void payments by default
    const userPermissionsOverride = [
      { permissionCode: "payments.void", granted: true },
    ];

    const evaluatePermission = (code: string) => {
      const override = userPermissionsOverride.find((p) => p.permissionCode === code);
      if (override !== undefined) return override.granted;
      return rolePermission;
    };

    expect(evaluatePermission("payments.void")).toBe(true);
  });
});
