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
      "flex items-center gap-2 rounded-lg bg-success-soft border border-success/20 px-4 py-3 text-sm font-medium text-success animate-slide-up",
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

const insightConfig = {
  success: { icon: CheckCircle, color: "text-success", bg: "bg-success-soft", border: "border-success/20" },
  warning: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning-soft", border: "border-warning/20" },
  danger: { icon: XCircle, color: "text-danger", bg: "bg-danger-soft", border: "border-danger/20" },
  opportunity: { icon: Lightbulb, color: "text-warning", bg: "bg-warning-soft", border: "border-warning/20" },
  ai: { icon: Brain, color: "text-intelligence", bg: "bg-intelligence-soft", border: "border-intelligence/20" },
};

export function InsightCard({ type, title, description, impact, action, className }: InsightCardProps) {
  const config = insightConfig[type];
  const Icon = config.icon;

  return (
    <div className={cn(
      "rounded-xl border p-4 transition-default hover:shadow-sm",
      config.border,
      config.bg,
      className
    )}>
      <div className="flex items-start gap-3">
        <div className={cn("mt-0.5", config.color)}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold">{title}</h4>
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
          {impact && (
            <p className={cn("text-xs font-medium mt-1.5", config.color)}>
              {impact}
            </p>
          )}
          {action && <div className="mt-2">{action}</div>}
        </div>
      </div>
    </div>
  );
}

interface HealthScoreProps {
  score: number;
  label?: string;
  className?: string;
}

export function HealthScore({ score, label, className }: HealthScoreProps) {
  const color = score >= 80 ? "text-success" : score >= 60 ? "text-warning" : "text-danger";
  const bgColor = score >= 80 ? "bg-success" : score >= 60 ? "bg-warning" : "bg-danger";

  return (
    <div className={cn("rounded-xl border bg-card p-4", className)}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Business Health</span>
        {label && <span className={cn("text-xs font-medium", color)}>{label}</span>}
      </div>
      <div className="flex items-end gap-3">
        <div className="relative h-16 w-16">
          <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/50" />
            <circle
              cx="32" cy="32" r="28" fill="none" strokeWidth="6"
              strokeDasharray={`${(score / 100) * 175.9} 175.9`}
              className={bgColor}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn("text-lg font-bold", color)}>{score}</span>
          </div>
        </div>
        <div>
          <div className="text-2xl font-bold">{score}<span className="text-sm font-normal text-muted-foreground">/100</span></div>
          <div className={cn("text-sm font-medium", color)}>
            {score >= 80 ? "Healthy" : score >= 60 ? "Needs attention" : "Critical"}
          </div>
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

const severityConfig = {
  high: { dot: "bg-danger", label: "Urgent" },
  medium: { dot: "bg-warning", label: "Important" },
  low: { dot: "bg-success", label: "Suggested" },
};

export function ActionItem({ severity, title, description, action, className }: ActionItemProps) {
  const config = severityConfig[severity];

  return (
    <div className={cn("flex items-start gap-3 rounded-lg border p-3 transition-default hover:bg-muted/50", className)}>
      <div className={cn("h-2.5 w-2.5 rounded-full mt-1.5 shrink-0", config.dot)} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold">{title}</h4>
          <span className="text-[10px] font-medium text-muted-foreground uppercase">{config.label}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
