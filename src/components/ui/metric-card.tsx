"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function MetricCard({ title, value, change, changeLabel, icon, onClick, className }: MetricCardProps) {
  const trend = change !== undefined ? (change > 0 ? "up" : change < 0 ? "down" : "flat") : null;

  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-xl border bg-card p-4 text-left transition-default hover:shadow-md hover:border-primary/20 w-full",
        onClick && "cursor-pointer",
        className
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</span>
        {icon && <span className="text-muted-foreground">{icon}</span>}
      </div>
      <div className="text-2xl font-bold tracking-tight">{value}</div>
      {trend && (
        <div className="flex items-center gap-1 mt-1.5">
          {trend === "up" && <TrendingUp className="h-3.5 w-3.5 text-success" />}
          {trend === "down" && <TrendingDown className="h-3.5 w-3.5 text-danger" />}
          {trend === "flat" && <Minus className="h-3.5 w-3.5 text-muted-foreground" />}
          <span className={cn(
            "text-xs font-medium",
            trend === "up" && "text-success",
            trend === "down" && "text-danger",
            trend === "flat" && "text-muted-foreground"
          )}>
            {change! > 0 ? "+" : ""}{change}%
          </span>
          {changeLabel && <span className="text-xs text-muted-foreground">{changeLabel}</span>}
        </div>
      )}
    </button>
  );
}
