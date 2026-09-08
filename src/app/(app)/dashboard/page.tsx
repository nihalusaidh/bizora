import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { APP_NAME } from "@/lib/constants";
import { DashboardInsights } from "@/components/ai/dashboard-insights";
import { DashboardMetrics } from "@/components/dashboard/dashboard-metrics";
import { BusinessHealth } from "@/components/dashboard/business-health";
import { TodaysActions } from "@/components/dashboard/todays-actions";
import { QuickActions } from "@/components/dashboard/quick-actions";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: memberships } = await supabase
    .from("memberships")
    .select("business_id")
    .eq("user_id", user.id)
    .limit(1);

  if (!memberships || memberships.length === 0) {
    redirect("/onboarding");
  }

  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", memberships[0].business_id)
    .single();

  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {greeting} 👋
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s what matters about <span className="font-medium text-foreground">{business?.name || "your business"}</span> today.
        </p>
      </div>

      {/* Primary Metrics */}
      <DashboardMetrics businessId={memberships[0].business_id} />

      {/* Health + Actions Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <BusinessHealth businessId={memberships[0].business_id} />
        <TodaysActions businessId={memberships[0].business_id} />
        <QuickActions />
      </div>

      {/* AI Insights */}
      <DashboardInsights />
    </div>
  );
}
