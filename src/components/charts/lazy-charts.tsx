"use client";

import dynamic from "next/dynamic";
import { PageLoader } from "@/components/ui/skeleton";

export const LazyBarChart = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.BarChart })),
  { loading: () => <PageLoader />, ssr: false }
);

export const LazyLineChart = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.LineChart })),
  { loading: () => <PageLoader />, ssr: false }
);

export const LazyPieChart = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.PieChart })),
  { loading: () => <PageLoader />, ssr: false }
);

export const LazyAreaChart = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.AreaChart })),
  { loading: () => <PageLoader />, ssr: false }
);

export const LazyResponsiveContainer = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.ResponsiveContainer })),
  { ssr: false }
);

export const LazyBar = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.Bar })),
  { ssr: false }
);

export const LazyLine = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.Line })),
  { ssr: false }
);

export const LazyPie = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.Pie })),
  { ssr: false }
);

export const LazyArea = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.Area })),
  { ssr: false }
);

export const LazyXAxis = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.XAxis })),
  { ssr: false }
);

export const LazyYAxis = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.YAxis })),
  { ssr: false }
);

export const LazyCartesianGrid = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.CartesianGrid })),
  { ssr: false }
);

export const LazyTooltip = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.Tooltip })),
  { ssr: false }
);

export const LazyLegend = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.Legend })),
  { ssr: false }
);
