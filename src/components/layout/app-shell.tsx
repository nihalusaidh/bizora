"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { MobileNav } from "./mobile-nav";
import { PwaInstallPrompt } from "@/components/pwa/pwa-install-prompt";
import { GlobalSearch } from "@/components/search/global-search";
import { useServiceWorker } from "@/lib/hooks/use-service-worker";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useServiceWorker();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r">
        <Sidebar />
      </div>

      {/* Mobile sidebar */}
      <MobileNav open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar onMenuToggle={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 lg:pb-6">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40">
        <MobileNav bottomNav />
      </div>

      {/* Global Search Overlay */}
      <GlobalSearch />

      {/* PWA Install Prompt */}
      <PwaInstallPrompt />
    </div>
  );
}
