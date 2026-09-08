"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowLeft, Package, Users, BarChart3, Play } from "lucide-react";

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
    description: "Upload a CSV/Excel file with your products",
    icon: Package,
  },
  {
    id: "customers",
    label: "Import customers",
    description: "Upload a CSV/Excel file with your customers",
    icon: Users,
  },
  {
    id: "stock",
    label: "Import opening stock",
    description: "Set initial stock quantities for products",
    icon: BarChart3,
  },
];

export function ImportStep({ onNext, onBack }: ImportStepProps) {
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
              onClick={onNext}
              className={cn(
                "flex items-center gap-4 w-full rounded-lg border bg-muted/30 p-4 text-left transition-all hover:bg-muted/50"
              )}
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <option.icon className="h-5 w-5 text-primary" />
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
