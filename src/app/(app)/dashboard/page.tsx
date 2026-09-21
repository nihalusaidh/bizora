import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardInsights } from "@/components/ai/dashboard-insights";
import { DashboardMetrics } from "@/components/dashboard/dashboard-metrics";
import { BusinessHealth } from "@/components/dashboard/business-health";
import { TodaysActions } from "@/components/dashboard/todays-actions";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { HeroGreeting } from "@/components/dashboard/greeting";

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

  return (
    <div className="space-y-5 animate-fade-in pb-24 lg:pb-6">
      {/* EarnKaro-style red hero */}
      <div className="rounded-2xl bg-[#DC2626] text-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-white/20 flex items-center justify-center text-lg font-extrabold shrink-0">
            {(business?.name || "B").slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <HeroGreeting businessName={business?.name || "Seller"} />
            <p className="text-xs text-white/75 truncate">
              Today&apos;s earnings & priorities at a glance
            </p>
          </div>
        </div>
      </div>

      {/* Primary Metrics */}
      <DashboardMetrics businessId={memberships[0].business_id} />

      {/* EarnKaro deal-list section */}
      <div className="flex items-center justify-between">
        <h2 className="text-[13px] font-bold uppercase tracking-wider text-[#DC2626] bizora-accent-line">
          Today&apos;s priorities
        </h2>
      </div>

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
