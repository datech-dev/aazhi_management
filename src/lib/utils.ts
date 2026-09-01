import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with clsx and tailwind-merge.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency value in INR.
 * Uses the Indian numbering system.
 */
export function formatCurrency(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined) return "₹0";
  const num = typeof amount === "string" ? parseFloat(amount) : Number(amount);
  if (isNaN(num)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Format a date for display in Indian format (IST).
 */
export function formatDate(
  date: Date | string | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
    ...options,
  });
}

/**
 * Format a date with time.
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });
}

/**
 * Format relative time (e.g., "2 hours ago", "yesterday").
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay === 1) return "yesterday";
  if (diffDay < 7) return `${diffDay}d ago`;
  return formatDate(d);
}

/**
 * Generate initials from a name.
 */
export function getInitials(name: string): string {
  if (!name) return "AZ";
  return name
    .split(" ")
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * Truncate text with ellipsis.
 */
export function truncate(str: string, length: number): string {
  if (!str) return "";
  if (str.length <= length) return str;
  return str.slice(0, length) + "…";
}

/**
 * Safe decimal addition for money calculations (in paisa).
 */
export function addMoney(...amounts: (number | string)[]): number {
  const total = amounts.reduce((sum: number, amount) => {
    const num = typeof amount === "string" ? parseFloat(amount) : Number(amount);
    return sum + Math.round((isNaN(num) ? 0 : num) * 100);
  }, 0);
  return total / 100;
}

/**
 * Safe decimal subtraction for money calculations.
 */
export function subtractMoney(a: number | string, b: number | string): number {
  const numA = typeof a === "string" ? parseFloat(a) : Number(a);
  const numB = typeof b === "string" ? parseFloat(b) : Number(b);
  return (Math.round((isNaN(numA) ? 0 : numA) * 100) - Math.round((isNaN(numB) ? 0 : numB) * 100)) / 100;
}

/**
 * Validate Indian phone number.
 */
export function isValidIndianPhone(phone: string): boolean {
  if (!phone) return false;
  const cleaned = phone.replace(/[\s\-\(\)]/g, "");
  return /^(\+91|91)?[6-9]\d{9}$/.test(cleaned);
}

/**
 * Format Indian phone number.
 */
export function formatPhone(phone: string): string {
  if (!phone) return "";
  const cleaned = phone.replace(/[\s\-\(\)]/g, "");
  const digits = cleaned.replace(/^\+?91/, "");
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return phone;
}
