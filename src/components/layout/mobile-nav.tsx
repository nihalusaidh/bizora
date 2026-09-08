"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Receipt,
  Package,
  Users,
  MoreHorizontal,
  X,
} from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";

const navigation = [
  { name: "Home", href: "/dashboard", icon: LayoutDashboard },
  { name: "Billing", href: "/billing", icon: Receipt },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "More", href: "/more", icon: MoreHorizontal },
];

const bottomNavItems = [
  navigation[0],
  navigation[1],
  navigation[2],
  navigation[3],
  navigation[4],
];

interface MobileNavProps {
  open?: boolean;
  onClose?: () => void;
  bottomNav?: boolean;
}

export function MobileNav({ open, onClose, bottomNav }: MobileNavProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  if (bottomNav) {
    return (
      <nav className="border-t border-border bg-background safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-1.5">
          {bottomNavItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px] font-medium transition-colors",
                  active ? "text-[#DC2626]" : "text-muted-foreground"
                )}
              >
                <item.icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="left" className="w-64 p-0 bg-[#0a0a0a] border-[#262626]">
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between px-6">
            <span className="text-lg font-bold tracking-tight text-white">BIZORA</span>
            <button onClick={onClose} className="text-[#737373] hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="flex-1 space-y-0.5 px-3 py-2">
            {navigation.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    active
                      ? "bg-white/10 text-white"
                      : "text-[#737373] hover:bg-white/5 hover:text-white"
                  )}
                >
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full bg-[#DC2626]" />
                  )}
                  <item.icon
                    className={cn(
                      "h-5 w-5 shrink-0",
                      active ? "text-[#DC2626]" : "text-[#525252]"
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}
