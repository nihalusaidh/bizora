"use client";

import { Badge } from "@/components/ui/badge";

interface StatCardProps {
  label: string;
  value: string;
  change?: number;
  prefix?: string;
  suffix?: string;
  variant?: "default" | "destructive" | "success";
}

export function StatCard({ label, value, change, prefix = "", suffix = "", variant = "default" }: StatCardProps) {
  const valueColor = variant === "destructive" ? "text-[#DC2626]" : variant === "success" ? "text-foreground" : "text-foreground";

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="text-sm text-muted-foreground mb-1">{label}</div>
      <div className={`text-2xl font-bold ${valueColor}`}>
        {prefix}{value}{suffix}
      </div>
      {change !== undefined && (
        <div className="mt-1">
          <Badge variant={change >= 0 ? "default" : "destructive"} className="text-xs">
            {change >= 0 ? "↑" : "↓"} {Math.abs(change).toFixed(1)}%
          </Badge>
        </div>
      )}
    </div>
  );
}
