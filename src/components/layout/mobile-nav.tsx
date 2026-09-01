"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Inbox,
  ShoppingBag,
  Users,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const mobileNavItems = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/inbox", label: "Inbox", icon: Inbox },
  { href: "/orders", label: "Orders", icon: ShoppingBag },
  { href: "/customers", label: "Clients", icon: Users },
];

export function MobileNav() {
  const pathname = usePathname();
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  return (
    <>
      {/* Floating quick-add button */}
      <button
        onClick={() => setShowQuickAdd(!showQuickAdd)}
        className="lg:hidden fixed bottom-20 right-4 z-50 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors active:scale-95"
        aria-label="Quick add"
      >
        <Plus className={cn("w-6 h-6 transition-transform", showQuickAdd && "rotate-45")} />
      </button>

      {/* Quick add overlay */}
      {showQuickAdd && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
            onClick={() => setShowQuickAdd(false)}
          />
          <div className="lg:hidden fixed bottom-36 right-4 z-50 bg-card rounded-xl border border-border shadow-2xl w-52 py-2">
            {[
              { label: "New Customer", href: "/customers/new" },
              { label: "New Enquiry", href: "/leads/new" },
              { label: "New Order", href: "/orders/new" },
              { label: "Record Payment", href: "/payments/new" },
              { label: "Update Status", href: "/tailoring" },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                onClick={() => setShowQuickAdd(false)}
                className="block px-4 py-2.5 text-sm hover:bg-muted transition-colors"
              >
                {action.label}
              </Link>
            ))}
          </div>
        </>
      )}

      {/* Bottom tab bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-card border-t border-border safe-area-bottom">
        <div className="flex items-center justify-around h-16">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-lg min-w-[60px] transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
