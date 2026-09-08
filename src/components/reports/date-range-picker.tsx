"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onChange: (start: string, end: string) => void;
}

export function DateRangePicker({ startDate, endDate, onChange }: DateRangePickerProps) {
  const presets = [
    { label: "This Month", value: "this_month" },
    { label: "Last Month", value: "last_month" },
    { label: "This Quarter", value: "this_quarter" },
    { label: "This Year", value: "this_year" },
    { label: "Last 30 Days", value: "last_30" },
    { label: "Last 90 Days", value: "last_90" },
  ];

  const applyPreset = (value: string) => {
    const now = new Date();
    let start: Date;
    let end: Date = new Date(now);

    switch (value) {
      case "this_month":
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "last_month":
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case "this_quarter":
        const quarter = Math.floor(now.getMonth() / 3);
        start = new Date(now.getFullYear(), quarter * 3, 1);
        break;
      case "this_year":
        start = new Date(now.getFullYear(), 0, 1);
        break;
      case "last_30":
        start = new Date(now);
        start.setDate(start.getDate() - 30);
        break;
      case "last_90":
        start = new Date(now);
        start.setDate(start.getDate() - 90);
        break;
      default:
        return;
    }

    onChange(
      start.toISOString().split("T")[0],
      end.toISOString().split("T")[0]
    );
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-end">
      <div className="flex-1 w-full sm:w-auto">
        <Label className="text-xs">From</Label>
        <Input
          type="date"
          value={startDate}
          onChange={(e) => onChange(e.target.value, endDate)}
          className="h-9"
        />
      </div>
      <div className="flex-1 w-full sm:w-auto">
        <Label className="text-xs">To</Label>
        <Input
          type="date"
          value={endDate}
          onChange={(e) => onChange(startDate, e.target.value)}
          className="h-9"
        />
      </div>
      <Select onValueChange={(v: string | null) => { if (v) applyPreset(v); }}>
        <SelectTrigger className="w-full sm:w-40 h-9">
          <SelectValue placeholder="Quick select" />
        </SelectTrigger>
        <SelectContent>
          {presets.map((p) => (
            <SelectItem key={p.value} value={p.value}>
              {p.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
