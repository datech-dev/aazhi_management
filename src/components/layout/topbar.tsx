"use client";

import { useState } from "react";
import {
  Search,
  Bell,
  Plus,
  Menu,
  X,
  Users,
  Target,
  ShoppingBag,
  FileText,
  CreditCard,
  Ruler,
  Package,
  LogOut,
  User,
  Settings,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface TopbarProps {
  user: {
    name: string;
    email: string;
    role: string;
  } | null;
}

const quickActions = [
  { label: "New Customer", href: "/customers/new", icon: Users },
  { label: "New Enquiry", href: "/leads/new", icon: Target },
  { label: "New Order", href: "/orders/new", icon: ShoppingBag },
  { label: "New Quotation", href: "/quotations/new", icon: FileText },
  { label: "Record Payment", href: "/payments/new", icon: CreditCard },
  { label: "New Product", href: "/products/new", icon: Package },
  { label: "New Measurement", href: "/measurements/new", icon: Ruler },
];

export function Topbar({ user }: TopbarProps) {
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const pathname = usePathname();

  // Get the current page title
  const getPageTitle = () => {
    if (pathname === "/") return "Dashboard";
    const segment = pathname.split("/")[1];
    return segment
      ? segment.charAt(0).toUpperCase() + segment.slice(1)
      : "Dashboard";
  };

  return (
    <header className="sticky top-0 z-40 flex items-center h-16 px-4 lg:px-6 bg-card border-b border-border">
      {/* Mobile menu button */}
      <button
        className="lg:hidden mr-3 p-2 -ml-2 rounded-md hover:bg-muted transition-colors"
        onClick={() => setShowMobileMenu(!showMobileMenu)}
        aria-label="Toggle menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Page title (mobile) / Search (desktop) */}
      <div className="flex-1 flex items-center">
        <h2 className="lg:hidden text-lg font-semibold font-heading">
          {getPageTitle()}
        </h2>

        {/* Search bar - desktop */}
        <div className="hidden lg:flex items-center flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search customers, orders, products..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-muted/50 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:bg-card transition-colors"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground bg-muted rounded border">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1">
        {/* Search - mobile */}
        <button className="lg:hidden p-2 rounded-md hover:bg-muted transition-colors">
          <Search className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Quick add */}
        <div className="relative">
          <button
            onClick={() => {
              setShowQuickActions(!showQuickActions);
              setShowUserMenu(false);
            }}
            className="p-2 rounded-md hover:bg-muted transition-colors"
            aria-label="Quick actions"
          >
            <Plus className="w-5 h-5 text-muted-foreground" />
          </button>

          {showQuickActions && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowQuickActions(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-52 bg-card rounded-lg border border-border shadow-lg z-50 py-1">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={action.href}
                      href={action.href}
                      onClick={() => setShowQuickActions(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                    >
                      <Icon className="w-4 h-4 text-muted-foreground" />
                      {action.label}
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Notifications */}
        <Link
          href="/notifications"
          className="relative p-2 rounded-md hover:bg-muted transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 text-muted-foreground" />
          {/* Notification badge */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
        </Link>

        {/* User menu */}
        <div className="relative ml-1">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowQuickActions(false);
            }}
            className="flex items-center gap-2 p-1.5 rounded-md hover:bg-muted transition-colors"
            aria-label="User menu"
          >
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-xs font-medium text-primary-foreground">
                {user ? getInitials(user.name) : "?"}
              </span>
            </div>
          </button>

          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-56 bg-card rounded-lg border border-border shadow-lg z-50 py-1">
                {user && (
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    <span className="inline-flex mt-1 px-2 py-0.5 text-[10px] font-medium bg-primary/10 text-primary rounded-full">
                      {user.role}
                    </span>
                  </div>
                )}
                <Link
                  href="/settings/profile"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                >
                  <User className="w-4 h-4 text-muted-foreground" />
                  Profile
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                >
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  Settings
                </Link>
                <div className="border-t border-border mt-1 pt-1">
                  <button
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-muted transition-colors w-full text-left"
                    onClick={() => {
                      // Sign out logic
                    }}
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
