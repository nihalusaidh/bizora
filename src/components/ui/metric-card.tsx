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
  index?: number;
}

export function MetricCard({
  title,
  label,
  value,
  change,
  changeType = "neutral",
  icon,
  className,
  index = 0,
}: MetricCardProps) {
  const displayLabel = title || label;

  return (
    <div
      className={cn(
        "group rounded-xl border border-border bg-card p-5",
        "transition-all duration-200 ease-out",
        "hover:shadow-lg hover:shadow-black/5 hover:-translate-y-0.5 hover:border-border/80",
        "metric-pulse",
        className
      )}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {displayLabel}
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight financial-number text-foreground">
            {value}
          </p>
          {change && (
            <p
              className={cn(
                "mt-1.5 text-xs font-medium",
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
          <div className="rounded-xl bg-muted p-2.5 text-muted-foreground transition-all duration-200 group-hover:bg-[#DC2626]/10 group-hover:text-[#DC2626] group-hover:scale-110">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
