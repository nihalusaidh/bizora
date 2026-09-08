"use client";

import { cn } from "@/lib/utils";

interface MetricCardProps {
  title?: string;
  label?: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon?: React.ReactNode;
  className?: string;
}

export function MetricCard({
  title,
  label,
  value,
  change,
  changeType = "neutral",
  icon,
  className,
}: MetricCardProps) {
  const displayLabel = title || label;

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-4 transition-all hover:shadow-sm",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {displayLabel}
          </p>
          <p className="mt-1.5 text-2xl font-bold tracking-tight financial-number text-foreground">
            {value}
          </p>
          {change && (
            <p
              className={cn(
                "mt-1 text-xs font-medium",
                changeType === "positive" && "text-foreground",
                changeType === "negative" && "text-[#DC2626]",
                changeType === "neutral" && "text-muted-foreground"
              )}
            >
              {change}
            </p>
          )}
        </div>
        {icon && (
          <div className="rounded-lg bg-muted p-2 text-muted-foreground">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
