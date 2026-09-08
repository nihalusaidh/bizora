"use client";

import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { GlobalSearch } from "@/components/search/global-search";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageToggle } from "@/components/ui/language-toggle";

const pageTitles: Record<string, string> = {
  "/dashboard": "Home",
  "/billing": "Billing",
  "/inventory": "Inventory",
  "/customers": "Customers",
  "/insights": "Insights",
  "/ai": "AI Copilot",
  "/more": "More",
  "/settings": "Settings",
  "/notifications": "Notifications",
};

interface TopbarProps {
  onMenuToggle: () => void;
}

export function Topbar({ onMenuToggle }: TopbarProps) {
  const pathname = usePathname();

  const title =
    pageTitles[pathname] ||
    pathname
      .split("/")
      .filter(Boolean)
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" / ");

  return (
    <header className="flex h-16 items-center gap-4 border-b bg-background px-4 lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuToggle}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <h1 className="text-lg font-semibold">{title}</h1>

      <div className="ml-auto flex items-center gap-1">
        <GlobalSearch />
        <ThemeToggle />
        <LanguageToggle />
        <NotificationBell />
      </div>
    </header>
  );
}
