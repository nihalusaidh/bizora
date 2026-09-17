"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function EarnHero({
  title,
  subtitle,
  value,
  valueLabel,
  actionLabel,
  actionHref,
}: {
  title: string;
  subtitle?: string;
  value: string;
  valueLabel?: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="rounded-2xl bg-[#DC2626] text-white p-4 shadow-sm">
      <p className="text-xs uppercase tracking-wider text-white/70">{title}</p>
      <p className="mt-1 text-3xl font-extrabold financial-number">{value}</p>
      {valueLabel && <p className="text-xs text-white/70 mt-0.5">{valueLabel}</p>}
      {subtitle && <p className="text-sm text-white/85 mt-2">{subtitle}</p>}
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-3 inline-flex items-center gap-1 rounded-full bg-white px-4 py-2 text-sm font-bold text-[#DC2626]"
        >
          {actionLabel}
          <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

export function EarnSectionHeader({
  title,
  actionLabel,
  actionHref,
}: {
  title: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex items-center justify-between mt-2">
      <h2 className="text-[13px] font-bold uppercase tracking-wider text-[#DC2626] bizora-accent-line">
        {title}
      </h2>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="text-xs font-bold text-[#DC2626]">
          {actionLabel} →
        </Link>
      )}
    </div>
  );
}

export function EarnBadge({ children, tone = "red" }: { children: React.ReactNode; tone?: "red" | "dark" | "soft" | "outline" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold",
        tone === "red" && "bg-[#DC2626] text-white",
        tone === "dark" && "bg-[#0a0a0a] text-white",
        tone === "soft" && "bg-[#FEF2F2] text-[#B91C1C] border border-red-200",
        tone === "outline" && "border border-red-200 text-[#DC2626] bg-white"
      )}
    >
      {children}
    </span>
  );
}

export function DealRow({
  icon,
  title,
  subtitle,
  right,
  href,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  href?: string;
  onClick?: () => void;
}) {
  const inner = (
    <div className="flex items-center gap-3 rounded-xl border border-red-100 bg-white p-3 tap-effect">
      <div className="h-12 w-12 rounded-lg bg-[#FEF2F2] border border-red-100 flex items-center justify-center shrink-0 text-[#DC2626] text-xl font-extrabold">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold truncate">{title}</p>
        {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
      </div>
      {right && <div className="shrink-0 text-right">{right}</div>}
      {(href || onClick) && <ChevronRight className="h-4 w-4 text-red-300 shrink-0" />}
    </div>
  );
  if (href) return <Link href={href} className="block">{inner}</Link>;
  if (onClick) return <button onClick={onClick} className="w-full text-left">{inner}</button>;
  return inner;
}

export function ChipRow<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "shrink-0 rounded-full px-3 py-1.5 text-xs font-bold border",
            value === o.value
              ? "bg-[#DC2626] text-white border-[#DC2626]"
              : "bg-white text-muted-foreground border-red-100"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function StickyCta({
  label,
  sublabel,
  onClick,
  href,
}: {
  label: string;
  sublabel?: string;
  onClick?: () => void;
  href?: string;
}) {
  const cls =
    "flex w-full items-center justify-between rounded-xl bg-[#DC2626] text-white px-4 py-3 shadow-lg font-bold";
  const inner = (
    <>
      <span className="text-sm">{label}</span>
      {sublabel ? (
        <span className="rounded-full bg-white px-3 py-1 text-xs font-extrabold text-[#DC2626]">{sublabel}</span>
      ) : (
        <ChevronRight className="h-4 w-4" />
      )}
    </>
  );
  return (
    <div className="lg:hidden fixed bottom-[76px] inset-x-3 z-40">
      {href ? <Link href={href} className={cls}>{inner}</Link> : <button onClick={onClick} className={cls}>{inner}</button>}
    </div>
  );
}
