"use client";

import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, Search } from "lucide-react";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { GlobalSearch } from "@/components/search/global-search";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";

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
  className?: string;
}

export function Topbar({ onMenuToggle, className }: TopbarProps) {
  const pathname = usePathname();

  const title =
    pageTitles[pathname] ||
    pathname
      .split("/")
      .filter(Boolean)
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" / ");

  return (
    <header className={cn("flex h-14 items-center gap-4 border-b border-border bg-background px-4 lg:px-6 pt-[env(safe-area-inset-top)]", className)}>
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden text-foreground hover:bg-muted"
        onClick={onMenuToggle}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <h1 className="text-base font-semibold text-foreground">{title}</h1>

      <div className="ml-auto flex items-center gap-0.5">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden text-foreground hover:bg-muted"
          onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }))}
        >
          <Search className="h-5 w-5" />
        </Button>
        <GlobalSearch />
        <ThemeToggle />
        <NotificationBell />
      </div>
    </header>
  );
}
