import { AppShell } from "@/components/layout/app-shell";
import { BusinessProvider } from "@/components/providers/business-provider";
import { OfflineWrapper } from "@/components/providers/offline-wrapper";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <BusinessProvider>
      <OfflineWrapper>
        <AppShell>{children}</AppShell>
      </OfflineWrapper>
    </BusinessProvider>
  );
}
