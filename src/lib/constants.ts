/**
 * Application constants and configuration.
 */

// Order statuses with display info
export const ORDER_STATUSES = [
  { value: "DRAFT", label: "Draft", color: "bg-gray-100 text-gray-700" },
  { value: "CONFIRMED", label: "Confirmed", color: "bg-blue-100 text-blue-700" },
  { value: "MEASUREMENT_PENDING", label: "Measurement Pending", color: "bg-yellow-100 text-yellow-700" },
  { value: "CUTTING", label: "Cutting", color: "bg-orange-100 text-orange-700" },
  { value: "STITCHING", label: "Stitching", color: "bg-amber-100 text-amber-700" },
  { value: "FINISHING", label: "Finishing", color: "bg-purple-100 text-purple-700" },
  { value: "QUALITY_CHECK", label: "Quality Check", color: "bg-indigo-100 text-indigo-700" },
  { value: "ALTERATION", label: "Alteration", color: "bg-red-100 text-red-700" },
  { value: "READY", label: "Ready", color: "bg-emerald-100 text-emerald-700" },
  { value: "DELIVERED", label: "Delivered", color: "bg-teal-100 text-teal-700" },
  { value: "COMPLETED", label: "Completed", color: "bg-green-100 text-green-700" },
  { value: "CANCELLED", label: "Cancelled", color: "bg-red-100 text-red-700" },
] as const;

// Valid order status transitions
export const ORDER_STATUS_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["MEASUREMENT_PENDING", "CUTTING", "CANCELLED"],
  MEASUREMENT_PENDING: ["CUTTING", "CANCELLED"],
  CUTTING: ["STITCHING", "CANCELLED"],
  STITCHING: ["FINISHING", "CANCELLED"],
  FINISHING: ["QUALITY_CHECK"],
  QUALITY_CHECK: ["ALTERATION", "READY"],
  ALTERATION: ["QUALITY_CHECK", "FINISHING"],
  READY: ["DELIVERED"],
  DELIVERED: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

// Payment statuses
export const PAYMENT_STATUSES = [
  { value: "UNPAID", label: "Unpaid", color: "bg-red-100 text-red-700" },
  { value: "ADVANCE_PAID", label: "Advance Paid", color: "bg-yellow-100 text-yellow-700" },
  { value: "PARTIALLY_PAID", label: "Partially Paid", color: "bg-orange-100 text-orange-700" },
  { value: "FULLY_PAID", label: "Fully Paid", color: "bg-green-100 text-green-700" },
  { value: "REFUNDED", label: "Refunded", color: "bg-gray-100 text-gray-700" },
] as const;

// Lead statuses
export const LEAD_STATUSES = [
  { value: "NEW", label: "New", color: "bg-blue-100 text-blue-700" },
  { value: "CONTACTED", label: "Contacted", color: "bg-cyan-100 text-cyan-700" },
  { value: "INTERESTED", label: "Interested", color: "bg-yellow-100 text-yellow-700" },
  { value: "QUOTE_SENT", label: "Quote Sent", color: "bg-orange-100 text-orange-700" },
  { value: "NEGOTIATION", label: "Negotiation", color: "bg-amber-100 text-amber-700" },
  { value: "CONFIRMED", label: "Confirmed", color: "bg-green-100 text-green-700" },
  { value: "LOST", label: "Lost", color: "bg-red-100 text-red-700" },
  { value: "CONVERTED", label: "Converted", color: "bg-emerald-100 text-emerald-700" },
] as const;

// Conversation statuses
export const CONVERSATION_STATUSES = [
  { value: "NEW", label: "New", color: "bg-blue-100 text-blue-700" },
  { value: "OPEN", label: "Open", color: "bg-green-100 text-green-700" },
  { value: "WAITING_FOR_CUSTOMER", label: "Waiting", color: "bg-yellow-100 text-yellow-700" },
  { value: "FOLLOW_UP", label: "Follow Up", color: "bg-orange-100 text-orange-700" },
  { value: "CONVERTED", label: "Converted", color: "bg-emerald-100 text-emerald-700" },
  { value: "CLOSED", label: "Closed", color: "bg-gray-100 text-gray-700" },
] as const;

// Customer sources
export const CUSTOMER_SOURCES = [
  { value: "INSTAGRAM", label: "Instagram", icon: "Instagram" },
  { value: "WHATSAPP", label: "WhatsApp", icon: "MessageCircle" },
  { value: "WALK_IN", label: "Walk-in", icon: "Store" },
  { value: "REFERRAL", label: "Referral", icon: "Users" },
  { value: "PHONE", label: "Phone", icon: "Phone" },
  { value: "WEBSITE", label: "Website", icon: "Globe" },
  { value: "OTHER", label: "Other", icon: "MoreHorizontal" },
] as const;

// Channel types
export const CHANNEL_TYPES = [
  { value: "WHATSAPP", label: "WhatsApp", icon: "MessageCircle" },
  { value: "INSTAGRAM", label: "Instagram", icon: "Instagram" },
  { value: "PHONE", label: "Phone", icon: "Phone" },
  { value: "WALK_IN", label: "Walk-in", icon: "Store" },
  { value: "WEBSITE", label: "Website", icon: "Globe" },
  { value: "EMAIL", label: "Email", icon: "Mail" },
  { value: "MANUAL", label: "Manual", icon: "PenLine" },
] as const;

// Payment methods
export const PAYMENT_METHODS = [
  { value: "CASH", label: "Cash" },
  { value: "UPI", label: "UPI" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "CARD", label: "Card" },
  { value: "OTHER", label: "Other" },
] as const;

// Priority levels
export const PRIORITIES = [
  { value: "LOW", label: "Low", color: "bg-gray-100 text-gray-600" },
  { value: "MEDIUM", label: "Medium", color: "bg-blue-100 text-blue-600" },
  { value: "HIGH", label: "High", color: "bg-orange-100 text-orange-600" },
  { value: "URGENT", label: "Urgent", color: "bg-red-100 text-red-600" },
] as const;

// Delivery statuses
export const DELIVERY_STATUSES = [
  { value: "PENDING", label: "Pending", color: "bg-gray-100 text-gray-700" },
  { value: "SCHEDULED", label: "Scheduled", color: "bg-blue-100 text-blue-700" },
  { value: "OUT_FOR_DELIVERY", label: "Out for Delivery", color: "bg-yellow-100 text-yellow-700" },
  { value: "DELIVERED", label: "Delivered", color: "bg-green-100 text-green-700" },
  { value: "FAILED", label: "Failed", color: "bg-red-100 text-red-700" },
  { value: "RETURNED", label: "Returned", color: "bg-orange-100 text-orange-700" },
] as const;

// Production stages
export const PRODUCTION_STAGES = [
  { value: "MEASUREMENT_PENDING", label: "Measurement Pending", color: "bg-yellow-100 text-yellow-700" },
  { value: "CUTTING", label: "Cutting", color: "bg-orange-100 text-orange-700" },
  { value: "STITCHING", label: "Stitching", color: "bg-amber-100 text-amber-700" },
  { value: "FINISHING", label: "Finishing", color: "bg-purple-100 text-purple-700" },
  { value: "QUALITY_CHECK", label: "Quality Check", color: "bg-indigo-100 text-indigo-700" },
  { value: "ALTERATION", label: "Alteration", color: "bg-red-100 text-red-700" },
  { value: "READY", label: "Ready", color: "bg-emerald-100 text-emerald-700" },
] as const;

// Default product categories for boutique
export const DEFAULT_PRODUCT_CATEGORIES = [
  "Sarees",
  "Blouses",
  "Kurtis",
  "Dresses",
  "Lehengas",
  "Salwar",
  "Custom Designs",
  "Accessories",
] as const;

// Number sequence prefixes
export const NUMBER_PREFIXES = {
  ORDER: "AZ",
  QUOTATION: "QT",
  PAYMENT: "PAY",
  LEAD: "LD",
} as const;

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

// File upload limits
export const FILE_LIMITS = {
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_DOCUMENT_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  ALLOWED_DOCUMENT_TYPES: ["application/pdf"],
} as const;

// Navigation items for sidebar
export const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: "LayoutDashboard", permission: null },
  { href: "/inbox", label: "Inbox", icon: "Inbox", permission: "inbox.view" },
  { href: "/customers", label: "Customers", icon: "Users", permission: "customers.view" },
  { href: "/leads", label: "Leads", icon: "Target", permission: "leads.view" },
  { href: "/products", label: "Products", icon: "Package", permission: "products.view" },
  { href: "/orders", label: "Orders", icon: "ShoppingBag", permission: "orders.view" },
  { href: "/quotations", label: "Quotations", icon: "FileText", permission: "quotations.view" },
  { href: "/measurements", label: "Measurements", icon: "Ruler", permission: "measurements.view" },
  { href: "/tailoring", label: "Tailoring", icon: "Scissors", permission: "production.view" },
  { href: "/payments", label: "Payments", icon: "CreditCard", permission: "payments.view" },
  { href: "/inventory", label: "Inventory", icon: "Warehouse", permission: "inventory.view" },
  { href: "/deliveries", label: "Deliveries", icon: "Truck", permission: "deliveries.view" },
  { href: "/reports", label: "Reports", icon: "BarChart3", permission: "reports.view" },
  { href: "/staff", label: "Staff", icon: "UserCog", permission: "staff.view" },
  { href: "/settings", label: "Settings", icon: "Settings", permission: "settings.view" },
] as const;

// Mobile bottom nav (most-used sections)
export const MOBILE_NAV_ITEMS = [
  { href: "/", label: "Home", icon: "LayoutDashboard" },
  { href: "/inbox", label: "Inbox", icon: "Inbox" },
  { href: "/orders", label: "Orders", icon: "ShoppingBag" },
  { href: "/customers", label: "Customers", icon: "Users" },
] as const;
