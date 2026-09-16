"use client";

import { cn } from "@/lib/utils";
import { CheckCircle, AlertTriangle, XCircle, Lightbulb, Brain } from "lucide-react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4 text-center", className)}>
      {icon && <div className="mb-4 text-muted-foreground">{icon}</div>}
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-4">{description}</p>
      {action}
    </div>
  );
}

interface SuccessToastProps {
  message: string;
  className?: string;
}

export function SuccessToast({ message, className }: SuccessToastProps) {
  return (
    <div className={cn(
      "flex items-center gap-2 rounded-lg bg-foreground px-4 py-3 text-sm font-medium text-background animate-slide-up",
      className
    )}>
      <CheckCircle className="h-4 w-4" />
      {message}
    </div>
  );
}

interface InsightCardProps {
  type: "success" | "warning" | "danger" | "opportunity" | "ai";
  title: string;
  description: string;
  impact?: string;
  action?: React.ReactNode;
  className?: string;
}

export function InsightCard({ type, title, description, impact, action, className }: InsightCardProps) {
  const config = insightConfig[type];
  const Icon = config.icon;

  return (
    <div className={cn(
      "rounded-xl border border-border bg-card p-4 transition-default hover:shadow-sm",
      className
    )}>
      <div className="flex items-start gap-3">
        {config.showDot && (
          <div className="mt-1 h-2 w-2 rounded-full bg-[#DC2626] shrink-0" />
        )}
        {!config.showDot && (
          <div className={cn("mt-0.5 text-muted-foreground")}>
            <Icon className="h-4 w-4" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold">{title}</h4>
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          {impact && (
            <p className="text-xs font-semibold mt-1.5 financial-number">
              {impact}
            </p>
          )}
          {action && <div className="mt-2">{action}</div>}
        </div>
      </div>
    </div>
  );
}

const insightConfig = {
  success: { icon: CheckCircle, showDot: false },
  warning: { icon: AlertTriangle, showDot: false },
  danger: { icon: XCircle, showDot: true },
  opportunity: { icon: Lightbulb, showDot: true },
  ai: { icon: Brain, showDot: false },
};

interface HealthScoreProps {
  score: number;
  label?: string;
  className?: string;
}

export function HealthScore({ score, label, className }: HealthScoreProps) {
  const statusColor = score >= 80
    ? "text-foreground"
    : score >= 60
    ? "text-[#737373]"
    : "text-[#DC2626]";

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className={cn("rounded-xl border border-border bg-card p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Business Health</span>
        {label && <span className={cn("text-xs font-medium", statusColor)}>{label}</span>}
      </div>
      <div className="flex items-center gap-6">
        {/* Large animated circle */}
        <div className="relative h-28 w-28 shrink-0">
          <svg className="h-28 w-28 -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50" cy="50" r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              className="text-muted/30"
            />
            {/* Animated progress circle */}
            <circle
              cx="50" cy="50" r="45"
              fill="none"
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className={score >= 80 ? "stroke-foreground" : score >= 60 ? "stroke-[#737373]" : "stroke-[#DC2626]"}
              strokeLinecap="round"
              style={{
                transition: "stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            />
          </svg>
          {/* Score number in center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("text-3xl font-bold tracking-tight", statusColor)}>
              {score}
            </span>
            <span className="text-[10px] text-muted-foreground font-medium -mt-1">out of 100</span>
          </div>
        </div>
        {/* Status text */}
        <div className="space-y-1">
          <div className="text-3xl font-bold tracking-tight financial-number">
            {score}<span className="text-base font-normal text-muted-foreground">/100</span>
          </div>
          <div className={cn("text-sm font-semibold", statusColor)}>
            {score >= 80 ? "Excellent" : score >= 60 ? "Needs Attention" : "Critical"}
          </div>
          <p className="text-xs text-muted-foreground max-w-[180px]">
            {score >= 80
              ? "Your business is performing well"
              : score >= 60
              ? "Some areas need improvement"
              : "Immediate action recommended"}
          </p>
        </div>
      </div>
    </div>
  );
}

interface ActionItemProps {
  severity: "high" | "medium" | "low";
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function ActionItem({ severity, title, description, action, className }: ActionItemProps) {
  return (
    <div className={cn(
      "flex items-start gap-3 rounded-lg border border-border p-3 transition-default hover:bg-muted/50",
      className
    )}>
      <div className={cn(
        "mt-1.5 h-2 w-2 rounded-full shrink-0",
        severity === "high" ? "bg-[#DC2626]" : severity === "medium" ? "bg-[#737373]" : "bg-foreground/30"
      )} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold">{title}</h4>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
