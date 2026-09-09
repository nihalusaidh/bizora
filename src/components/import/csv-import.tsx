"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileText, AlertCircle, Check, X } from "lucide-react";

interface CsvImportProps {
  type: "products" | "customers";
  onImport: (data: Record<string, string>[]) => Promise<void>;
  onComplete?: () => void;
}

const PRODUCT_COLUMNS = ["name", "sku", "selling_price", "cost_price", "stock_quantity", "unit", "category"];
const CUSTOMER_COLUMNS = ["name", "phone", "email", "address", "gst_number"];

export function CsvImport({ type, onImport, onComplete }: CsvImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Record<string, string>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "preview" | "importing" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const requiredColumns = type === "products" ? PRODUCT_COLUMNS : CUSTOMER_COLUMNS;

  const parseCsv = (text: string): { headers: string[]; rows: Record<string, string>[] } => {
    const lines = text.split("\n").filter((l) => l.trim());
    if (lines.length < 2) return { headers: [], rows: [] };

    const csvHeaders = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));
    const rows = lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim());
      const row: Record<string, string> = {};
      csvHeaders.forEach((h, i) => {
        row[h] = values[i] || "";
      });
      return row;
    });

    return { headers: csvHeaders, rows };
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setError("");

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const { headers: h, rows } = parseCsv(text);

      if (rows.length === 0) {
        setError("No data rows found in the CSV file.");
        return;
      }

      setHeaders(h);
      setPreview(rows.slice(0, 5));
      setStatus("preview");
    };
    reader.readAsText(selected);
  };

  const handleImport = async () => {
    if (!file) return;

    setLoading(true);
    setStatus("importing");
    setError("");

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const text = event.target?.result as string;
        const { rows } = parseCsv(text);

        await onImport(rows);
        setStatus("done");
        setLoading(false);
        onComplete?.();
      };
      reader.readAsText(file);
    } catch (err) {
      setError("Failed to import data. Please check your CSV format.");
      setStatus("error");
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        {status === "idle" && (
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-[#DC2626]/50 transition-colors"
          >
            <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium text-sm">Click to upload CSV file</p>
            <p className="text-xs text-muted-foreground mt-1">
              Expected columns: {requiredColumns.join(", ")}
            </p>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        )}

        {status === "preview" && (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#DC2626]" />
                <span className="text-sm font-medium">{file?.name}</span>
              </div>
              <button
                onClick={() => { setFile(null); setStatus("idle"); setPreview([]); }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="text-xs text-muted-foreground">
              {preview.length} rows found (showing first 5)
            </div>

            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-muted">
                    {headers.slice(0, 6).map((h) => (
                      <th key={h} className="px-3 py-2 text-left font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, i) => (
                    <tr key={i} className="border-t">
                      {headers.slice(0, 6).map((h) => (
                        <td key={h} className="px-3 py-2 text-muted-foreground">
                          {row[h] || "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Button onClick={handleImport} className="w-full bg-[#DC2626] hover:bg-[#B91C1C]">
              Import {preview.length}+ rows
            </Button>
          </>
        )}

        {status === "importing" && (
          <div className="text-center py-8">
            <div className="h-8 w-8 border-2 border-[#DC2626] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium">Importing data...</p>
          </div>
        )}

        {status === "done" && (
          <div className="text-center py-8">
            <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Check className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-sm font-medium">Import complete!</p>
          </div>
        )}

        {status === "error" && (
          <div className="flex items-start gap-2 bg-red-50 text-red-700 rounded-lg p-3">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <p className="text-xs">{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
