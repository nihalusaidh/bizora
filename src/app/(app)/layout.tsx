import { AppShell } from "@/components/layout/app-shell";
import { BusinessProvider } from "@/components/providers/business-provider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <BusinessProvider>
      <AppShell>{children}</AppShell>
    </BusinessProvider>
  );
}
