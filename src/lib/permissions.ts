import { UserRole } from "@prisma/client";

/**
 * All available permissions in the system.
 * Format: "module.action"
 */
export const PERMISSIONS = {
  // Customers
  CUSTOMERS_VIEW: "customers.view",
  CUSTOMERS_CREATE: "customers.create",
  CUSTOMERS_EDIT: "customers.edit",
  CUSTOMERS_DELETE: "customers.delete",
  CUSTOMERS_IMPORT: "customers.import",
  CUSTOMERS_EXPORT: "customers.export",

  // Orders
  ORDERS_VIEW: "orders.view",
  ORDERS_CREATE: "orders.create",
  ORDERS_EDIT: "orders.edit",
  ORDERS_CANCEL: "orders.cancel",
  ORDERS_STATUS: "orders.status",

  // Products
  PRODUCTS_VIEW: "products.view",
  PRODUCTS_CREATE: "products.create",
  PRODUCTS_EDIT: "products.edit",
  PRODUCTS_DELETE: "products.delete",

  // Leads
  LEADS_VIEW: "leads.view",
  LEADS_CREATE: "leads.create",
  LEADS_EDIT: "leads.edit",
  LEADS_DELETE: "leads.delete",

  // Payments
  PAYMENTS_VIEW: "payments.view",
  PAYMENTS_CREATE: "payments.create",
  PAYMENTS_VOID: "payments.void",
  PAYMENTS_REFUND: "payments.refund",

  // Quotations
  QUOTATIONS_VIEW: "quotations.view",
  QUOTATIONS_CREATE: "quotations.create",
  QUOTATIONS_EDIT: "quotations.edit",

  // Measurements
  MEASUREMENTS_VIEW: "measurements.view",
  MEASUREMENTS_CREATE: "measurements.create",
  MEASUREMENTS_EDIT: "measurements.edit",
  MEASUREMENTS_TEMPLATES: "measurements.templates",

  // Production / Tailoring
  PRODUCTION_VIEW: "production.view",
  PRODUCTION_MANAGE: "production.manage",
  PRODUCTION_QC: "production.qc",

  // Inventory
  INVENTORY_VIEW: "inventory.view",
  INVENTORY_EDIT: "inventory.edit",
  INVENTORY_TRANSACTIONS: "inventory.transactions",

  // Conversations / Inbox
  INBOX_VIEW: "inbox.view",
  INBOX_RESPOND: "inbox.respond",
  INBOX_ASSIGN: "inbox.assign",

  // Deliveries
  DELIVERIES_VIEW: "deliveries.view",
  DELIVERIES_MANAGE: "deliveries.manage",

  // Reports
  REPORTS_VIEW: "reports.view",
  REPORTS_EXPORT: "reports.export",

  // Staff
  STAFF_VIEW: "staff.view",
  STAFF_MANAGE: "staff.manage",

  // Settings
  SETTINGS_VIEW: "settings.view",
  SETTINGS_MANAGE: "settings.manage",

  // Audit
  AUDIT_VIEW: "audit.view",

  // Notifications
  NOTIFICATIONS_VIEW: "notifications.view",
} as const;

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/**
 * Default permissions per role.
 * OWNER has all permissions implicitly.
 */
export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, PermissionCode[]> = {
  OWNER: Object.values(PERMISSIONS),
  
  ADMIN: Object.values(PERMISSIONS).filter(
    (p) => !["settings.manage", "staff.manage", "audit.view"].some((excluded) => p === excluded)
  ),

  STAFF: [
    PERMISSIONS.CUSTOMERS_VIEW,
    PERMISSIONS.CUSTOMERS_CREATE,
    PERMISSIONS.CUSTOMERS_EDIT,
    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.ORDERS_CREATE,
    PERMISSIONS.ORDERS_EDIT,
    PERMISSIONS.ORDERS_STATUS,
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.LEADS_VIEW,
    PERMISSIONS.LEADS_CREATE,
    PERMISSIONS.LEADS_EDIT,
    PERMISSIONS.PAYMENTS_VIEW,
    PERMISSIONS.PAYMENTS_CREATE,
    PERMISSIONS.QUOTATIONS_VIEW,
    PERMISSIONS.QUOTATIONS_CREATE,
    PERMISSIONS.QUOTATIONS_EDIT,
    PERMISSIONS.MEASUREMENTS_VIEW,
    PERMISSIONS.MEASUREMENTS_CREATE,
    PERMISSIONS.MEASUREMENTS_EDIT,
    PERMISSIONS.PRODUCTION_VIEW,
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.INBOX_VIEW,
    PERMISSIONS.INBOX_RESPOND,
    PERMISSIONS.DELIVERIES_VIEW,
    PERMISSIONS.DELIVERIES_MANAGE,
    PERMISSIONS.NOTIFICATIONS_VIEW,
  ],

  SALES: [
    PERMISSIONS.CUSTOMERS_VIEW,
    PERMISSIONS.CUSTOMERS_CREATE,
    PERMISSIONS.CUSTOMERS_EDIT,
    PERMISSIONS.CUSTOMERS_EXPORT,
    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.ORDERS_CREATE,
    PERMISSIONS.ORDERS_EDIT,
    PERMISSIONS.PRODUCTS_VIEW,
    PERMISSIONS.LEADS_VIEW,
    PERMISSIONS.LEADS_CREATE,
    PERMISSIONS.LEADS_EDIT,
    PERMISSIONS.PAYMENTS_VIEW,
    PERMISSIONS.PAYMENTS_CREATE,
    PERMISSIONS.QUOTATIONS_VIEW,
    PERMISSIONS.QUOTATIONS_CREATE,
    PERMISSIONS.QUOTATIONS_EDIT,
    PERMISSIONS.INBOX_VIEW,
    PERMISSIONS.INBOX_RESPOND,
    PERMISSIONS.INBOX_ASSIGN,
    PERMISSIONS.DELIVERIES_VIEW,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.NOTIFICATIONS_VIEW,
  ],

  TAILOR: [
    PERMISSIONS.ORDERS_VIEW,
    PERMISSIONS.ORDERS_STATUS,
    PERMISSIONS.MEASUREMENTS_VIEW,
    PERMISSIONS.MEASUREMENTS_CREATE,
    PERMISSIONS.PRODUCTION_VIEW,
    PERMISSIONS.PRODUCTION_MANAGE,
    PERMISSIONS.PRODUCTION_QC,
    PERMISSIONS.INVENTORY_VIEW,
    PERMISSIONS.NOTIFICATIONS_VIEW,
  ],
};

/**
 * Permission metadata for admin UI.
 */
export const PERMISSION_MODULES = [
  {
    module: "customers",
    label: "Customers",
    permissions: [
      { code: PERMISSIONS.CUSTOMERS_VIEW, label: "View customers" },
      { code: PERMISSIONS.CUSTOMERS_CREATE, label: "Create customers" },
      { code: PERMISSIONS.CUSTOMERS_EDIT, label: "Edit customers" },
      { code: PERMISSIONS.CUSTOMERS_DELETE, label: "Archive customers" },
      { code: PERMISSIONS.CUSTOMERS_IMPORT, label: "Import customers" },
      { code: PERMISSIONS.CUSTOMERS_EXPORT, label: "Export customers" },
    ],
  },
  {
    module: "orders",
    label: "Orders",
    permissions: [
      { code: PERMISSIONS.ORDERS_VIEW, label: "View orders" },
      { code: PERMISSIONS.ORDERS_CREATE, label: "Create orders" },
      { code: PERMISSIONS.ORDERS_EDIT, label: "Edit orders" },
      { code: PERMISSIONS.ORDERS_CANCEL, label: "Cancel orders" },
      { code: PERMISSIONS.ORDERS_STATUS, label: "Change order status" },
    ],
  },
  {
    module: "products",
    label: "Products",
    permissions: [
      { code: PERMISSIONS.PRODUCTS_VIEW, label: "View products" },
      { code: PERMISSIONS.PRODUCTS_CREATE, label: "Create products" },
      { code: PERMISSIONS.PRODUCTS_EDIT, label: "Edit products" },
      { code: PERMISSIONS.PRODUCTS_DELETE, label: "Archive products" },
    ],
  },
  {
    module: "leads",
    label: "Leads & Enquiries",
    permissions: [
      { code: PERMISSIONS.LEADS_VIEW, label: "View leads" },
      { code: PERMISSIONS.LEADS_CREATE, label: "Create leads" },
      { code: PERMISSIONS.LEADS_EDIT, label: "Edit leads" },
      { code: PERMISSIONS.LEADS_DELETE, label: "Archive leads" },
    ],
  },
  {
    module: "payments",
    label: "Payments",
    permissions: [
      { code: PERMISSIONS.PAYMENTS_VIEW, label: "View payments" },
      { code: PERMISSIONS.PAYMENTS_CREATE, label: "Record payments" },
      { code: PERMISSIONS.PAYMENTS_VOID, label: "Void payments" },
      { code: PERMISSIONS.PAYMENTS_REFUND, label: "Process refunds" },
    ],
  },
  {
    module: "production",
    label: "Production & Tailoring",
    permissions: [
      { code: PERMISSIONS.PRODUCTION_VIEW, label: "View production" },
      { code: PERMISSIONS.PRODUCTION_MANAGE, label: "Manage production" },
      { code: PERMISSIONS.PRODUCTION_QC, label: "Quality checks" },
    ],
  },
  {
    module: "inventory",
    label: "Inventory",
    permissions: [
      { code: PERMISSIONS.INVENTORY_VIEW, label: "View inventory" },
      { code: PERMISSIONS.INVENTORY_EDIT, label: "Edit inventory" },
      { code: PERMISSIONS.INVENTORY_TRANSACTIONS, label: "Stock transactions" },
    ],
  },
  {
    module: "inbox",
    label: "Inbox / Messaging",
    permissions: [
      { code: PERMISSIONS.INBOX_VIEW, label: "View conversations" },
      { code: PERMISSIONS.INBOX_RESPOND, label: "Respond to messages" },
      { code: PERMISSIONS.INBOX_ASSIGN, label: "Assign conversations" },
    ],
  },
  {
    module: "reports",
    label: "Reports",
    permissions: [
      { code: PERMISSIONS.REPORTS_VIEW, label: "View reports" },
      { code: PERMISSIONS.REPORTS_EXPORT, label: "Export reports" },
    ],
  },
  {
    module: "staff",
    label: "Staff Management",
    permissions: [
      { code: PERMISSIONS.STAFF_VIEW, label: "View staff" },
      { code: PERMISSIONS.STAFF_MANAGE, label: "Manage staff & roles" },
    ],
  },
  {
    module: "settings",
    label: "Settings",
    permissions: [
      { code: PERMISSIONS.SETTINGS_VIEW, label: "View settings" },
      { code: PERMISSIONS.SETTINGS_MANAGE, label: "Manage settings" },
    ],
  },
] as const;

/**
 * Check if a role has a specific permission.
 * OWNER always has all permissions.
 */
export function hasRolePermission(
  role: UserRole,
  permission: PermissionCode
): boolean {
  if (role === "OWNER") return true;
  return DEFAULT_ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
