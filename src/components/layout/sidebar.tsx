"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Receipt,
  Package,
  Users,
  BarChart3,
  Bot,
  MoreHorizontal,
  Settings,
  HelpCircle,
} from "lucide-react";

const navigation = [
  { name: "Home", href: "/dashboard", icon: LayoutDashboard },
  { name: "Billing", href: "/billing", icon: Receipt },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "Insights", href: "/insights", icon: BarChart3 },
  { name: "AI", href: "/ai", icon: Bot },
];

const bottomNavigation = [
  { name: "More", href: "/more", icon: MoreHorizontal },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Help", href: "/help", icon: HelpCircle },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <div className="flex h-full flex-col bg-[#0a0a0a]">
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-[#DC2626] flex items-center justify-center">
            <span className="text-white font-bold text-sm tracking-tight">B</span>
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            BIZORA
          </span>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 space-y-0.5 px-3 py-2">
        {navigation.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
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
                  "h-5 w-5 shrink-0 transition-colors",
                  active ? "text-[#DC2626]" : "text-[#525252] group-hover:text-[#a3a3a3]"
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t border-[#262626] px-3 py-2">
        {bottomNavigation.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
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
                  "h-5 w-5 shrink-0 transition-colors",
                  active ? "text-[#DC2626]" : "text-[#525252] group-hover:text-[#a3a3a3]"
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </div>

      {/* Plan Badge */}
      <div className="px-4 pb-4">
        <div className="rounded-lg bg-white/5 border border-[#262626] px-3 py-2 text-center">
          <span className="text-xs text-[#525252]">Free Plan</span>
        </div>
      </div>
    </div>
  );
}
