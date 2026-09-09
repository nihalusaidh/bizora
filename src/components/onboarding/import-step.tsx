"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowLeft, Package, Users, Play } from "lucide-react";
import { CsvImport } from "@/components/import/csv-import";
import { useBusiness } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";

interface ImportStepProps {
  onNext: () => void;
  onBack: () => void;
}

const importOptions = [
  {
    id: "fresh",
    label: "Start fresh",
    description: "Add products manually as you go",
    icon: Play,
  },
  {
    id: "products",
    label: "Import products",
    description: "Upload a CSV file with your products",
    icon: Package,
  },
  {
    id: "customers",
    label: "Import customers",
    description: "Upload a CSV file with your customers",
    icon: Users,
  },
] as const;

type ImportOption = (typeof importOptions)[number]["id"];

export function ImportStep({ onNext, onBack }: ImportStepProps) {
  const [selectedOption, setSelectedOption] = useState<ImportOption | null>(null);
  const { businessId } = useBusiness();

  const handleImport = async (type: "products" | "customers", data: Record<string, string>[]) => {
    if (!businessId) return;
    const supabase = createClient();

    if (type === "products") {
      const products = data.map((row) => ({
        business_id: businessId,
        name: row.name || "Untitled Product",
        sku: row.sku || null,
        selling_price: parseFloat(row.selling_price) || 0,
        cost_price: parseFloat(row.cost_price) || 0,
        stock_quantity: parseInt(row.stock_quantity) || 0,
        unit: row.unit || "pcs",
        is_active: true,
      }));
      await supabase.from("products").insert(products);
    } else {
      const customers = data.map((row) => ({
        business_id: businessId,
        name: row.name || "Untitled Customer",
        phone: row.phone || null,
        email: row.email || null,
        address: row.address || null,
        gst_number: row.gst_number || null,
        outstanding_balance: 0,
        total_spend: 0,
        purchase_count: 0,
        preferred_delivery: "ask",
        is_active: true,
      }));
      await supabase.from("customers").insert(customers);
    }
  };

  if (selectedOption === "products" || selectedOption === "customers") {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">
            Import {selectedOption === "products" ? "Products" : "Customers"}
          </CardTitle>
          <CardDescription>
            Upload a CSV file with your {selectedOption}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <CsvImport
            type={selectedOption}
            onImport={(data) => handleImport(selectedOption, data)}
            onComplete={onNext}
          />
          <Button type="button" variant="outline" onClick={() => setSelectedOption(null)} className="w-full">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Import existing data</CardTitle>
        <CardDescription>
          Bring your data into Bizora or start fresh
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {importOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => {
                if (option.id === "fresh") {
                  onNext();
                } else {
                  setSelectedOption(option.id);
                }
              }}
              className={cn(
                "flex items-center gap-4 w-full rounded-lg border bg-muted/30 p-4 text-left transition-all hover:bg-muted/50"
              )}
            >
              <div className="h-10 w-10 rounded-lg bg-[#DC2626]/10 flex items-center justify-center">
                <option.icon className="h-5 w-5 text-[#DC2626]" />
              </div>
              <div>
                <div className="font-medium">{option.label}</div>
                <div className="text-sm text-muted-foreground">{option.description}</div>
              </div>
            </button>
          ))}
        </div>
        <p className="text-xs text-center text-muted-foreground">
          You can always import data later from Settings
        </p>
        <Button type="button" variant="outline" onClick={onBack} className="w-full">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </CardContent>
    </Card>
  );
}
