import { AppShell } from "@/components/layout/app-shell";
import { BusinessProvider } from "@/components/providers/business-provider";
import { PlanSyncProvider } from "@/components/providers/plan-sync-provider";
import { OfflineWrapper } from "@/components/providers/offline-wrapper";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <BusinessProvider>
      <PlanSyncProvider>
        <OfflineWrapper>
          <AppShell>{children}</AppShell>
        </OfflineWrapper>
      </PlanSyncProvider>
    </BusinessProvider>
  );
}
