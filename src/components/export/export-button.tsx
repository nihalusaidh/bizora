"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";

interface ExportColumn {
  key: string;
  label: string;
}

interface ExportButtonProps {
  data: Record<string, unknown>[];
  filename: string;
  columns?: ExportColumn[];
  format?: "csv" | "pdf";
}

function getColumns(data: Record<string, unknown>[], columns?: ExportColumn[]): ExportColumn[] {
  if (columns && columns.length > 0) return columns;
  if (data.length === 0) return [];
  return Object.keys(data[0]).map((key) => ({ key, label: key }));
}

function generateCsv(data: Record<string, unknown>[], columns: ExportColumn[]): string {
  const headers = columns.map((c) => c.label);
  const rows = data.map((row) =>
    columns.map((col) => {
      const val = row[col.key];
      const str = val === null || val === undefined ? "" : String(val);
      if (str.includes(",") || str.includes("\n") || str.includes('"')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    })
  );
  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

function exportPdf(data: Record<string, unknown>[], columns: ExportColumn[], filename: string) {
  const headers = columns.map((c) => c.label);
  const rows = data.map((row) => columns.map((col) => String(row[col.key] ?? "")));

  const html = `<!DOCTYPE html>
<html><head><title>${filename}</title>
<style>
  body { font-family: system-ui, sans-serif; padding: 2rem; }
  h1 { font-size: 1.25rem; margin-bottom: 1rem; }
  table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
  th, td { border: 1px solid #e5e5e5; padding: 0.5rem 0.75rem; text-align: left; }
  th { background: #fafafa; font-weight: 600; }
  tr:nth-child(even) { background: #fafafa; }
</style></head><body>
<h1>${filename}</h1>
<table>
  <thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
  <tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody>
</table>
<script>window.onload=function(){window.print();}<\/script>
</body></html>`;

  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}

export function ExportButton({ data, filename, columns }: ExportButtonProps) {
  const [exporting, setExporting] = useState<"csv" | "pdf" | null>(null);
  const resolvedColumns = getColumns(data, columns);

  const handleExport = async (format: "csv" | "pdf") => {
    setExporting(format);
    try {
      await new Promise((r) => setTimeout(r, 300));
      if (format === "csv") {
        const csv = generateCsv(data, resolvedColumns);
        downloadFile(csv, `${filename}.csv`, "text/csv;charset=utf-8;");
      } else {
        exportPdf(data, resolvedColumns, filename);
      }
    } finally {
      setTimeout(() => setExporting(null), 300);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" size="sm" disabled={data.length === 0} />}>
        {exporting ? (
          <Loader2 className="h-4 w-4 animate-spin mr-1" />
        ) : (
          <Download className="h-4 w-4 mr-1" />
        )}
        Export
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport("csv")}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExport("pdf")}>
          <FileText className="h-4 w-4 mr-2" />
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
