"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

interface DataSeries {
  key: string;
  color: string;
  label?: string;
}

interface BizoraChartProps {
  type: "line" | "bar" | "area" | "pie";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  dataKey: string;
  dataKeys?: DataSeries[];
  xAxisKey?: string;
  height?: number;
  color?: string;
  showGrid?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
  title?: string;
  subtitle?: string;
  formatValue?: (value: number) => string;
}

interface TooltipPayloadItem {
  value: number;
  name: string;
  dataKey: string;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
  formatValue?: (value: number) => string;
}

function CustomTooltip({ active, payload, label, formatValue }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-border bg-[#0a0a0a] px-3 py-2 text-xs shadow-lg dark:bg-[#fafafa]">
      {label && <p className="mb-1 font-medium text-[#fafafa] dark:text-[#0a0a0a]">{label}</p>}
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-[#a3a3a3] dark:text-[#525252]">{entry.name}:</span>
          <span className="font-semibold text-[#fafafa] dark:text-[#0a0a0a]">
            {formatValue ? formatValue(entry.value) : entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

const AXIS_STYLE = {
  fontSize: 11,
  tickLine: false,
  axisLine: false,
  stroke: "#a3a3a3",
};

export function BizoraChart({
  type,
  data,
  dataKey,
  dataKeys,
  xAxisKey = "name",
  height = 300,
  color = "#0a0a0a",
  showGrid = true,
  showTooltip = true,
  showLegend = false,
  title,
  subtitle,
  formatValue,
}: BizoraChartProps) {
  if (!data?.length) {
    return (
      <div className="rounded-xl border border-border bg-card">
        {(title || subtitle) && (
          <div className="px-5 pt-5">
            {title && <h3 className="text-base font-semibold">{title}</h3>}
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
        )}
        <div
          className="flex items-center justify-center text-sm text-muted-foreground"
          style={{ height }}
        >
          No data available
        </div>
      </div>
    );
  }

  const tooltipProps = showTooltip
    ? {
        content: <CustomTooltip formatValue={formatValue} />,
      }
    : { content: () => null };

  const gridProps = showGrid
    ? { strokeDasharray: "3 3", stroke: "#e5e5e5", className: "dark:stroke-[#262626]" }
    : {};

  const series: DataSeries[] = dataKeys?.length
    ? dataKeys
    : [{ key: dataKey, color }];

  function renderChart() {
    switch (type) {
      case "line":
        return (
          <LineChart data={data}>
            {showGrid && <CartesianGrid {...gridProps} />}
            <XAxis dataKey={xAxisKey} {...AXIS_STYLE} />
            <YAxis {...AXIS_STYLE} />
            <Tooltip {...tooltipProps} />
            {showLegend && <Legend />}
            {series.map((s) => (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label ?? s.key}
                stroke={s.color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: s.color }}
              />
            ))}
          </LineChart>
        );

      case "bar":
        return (
          <BarChart data={data}>
            {showGrid && <CartesianGrid {...gridProps} />}
            <XAxis dataKey={xAxisKey} {...AXIS_STYLE} />
            <YAxis {...AXIS_STYLE} />
            <Tooltip {...tooltipProps} />
            {showLegend && <Legend />}
            {series.map((s) => (
              <Bar
                key={s.key}
                dataKey={s.key}
                name={s.label ?? s.key}
                fill={s.color}
                radius={[4, 4, 0, 0]}
                opacity={0.85}
              />
            ))}
          </BarChart>
        );

      case "area":
        return (
          <AreaChart data={data}>
            <defs>
              {series.map((s) => (
                <linearGradient key={s.key} id={`gradient-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={s.color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={s.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            {showGrid && <CartesianGrid {...gridProps} />}
            <XAxis dataKey={xAxisKey} {...AXIS_STYLE} />
            <YAxis {...AXIS_STYLE} />
            <Tooltip {...tooltipProps} />
            {showLegend && <Legend />}
            {series.map((s) => (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label ?? s.key}
                stroke={s.color}
                strokeWidth={2}
                fill={`url(#gradient-${s.key})`}
              />
            ))}
          </AreaChart>
        );

      case "pie": {
        const PIE_COLORS = [color, "#DC2626", "#404040", "#737373", "#a3a3a3", "#525252"];
        return (
          <PieChart>
            <Tooltip {...tooltipProps} />
            {showLegend && <Legend />}
            <Pie
              data={data}
              dataKey={dataKey}
              nameKey={xAxisKey}
              cx="50%"
              cy="50%"
              outerRadius={Math.min(height * 0.4, 120)}
              innerRadius={Math.min(height * 0.2, 60)}
              strokeWidth={2}
              stroke="#fafafa"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        );
      }

      default:
        return null;
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      {(title || subtitle) && (
        <div className="px-5 pt-5">
          {title && <h3 className="text-base font-semibold">{title}</h3>}
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      )}
      <div className={title || subtitle ? "px-5 pb-5 pt-2" : "p-5"}>
        <ResponsiveContainer width="100%" height={height}>
          {renderChart() as React.ReactElement}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
