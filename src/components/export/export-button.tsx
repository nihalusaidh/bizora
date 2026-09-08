"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { downloadCsv } from "@/lib/export";
import { Loader2, Download } from "lucide-react";

interface ExportButtonProps {
  data: Record<string, unknown>[];
  filename: string;
  label?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "icon";
}

export function ExportButton({ data, filename, label = "Export CSV", variant = "outline", size = "sm" }: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      downloadCsv(data, filename);
    } finally {
      setTimeout(() => setExporting(false), 500);
    }
  };

  return (
    <Button variant={variant} size={size} onClick={handleExport} disabled={exporting || data.length === 0}>
      {exporting ? (
        <Loader2 className="h-4 w-4 animate-spin mr-1" />
      ) : (
        <Download className="h-4 w-4 mr-1" />
      )}
      {label}
    </Button>
  );
}
