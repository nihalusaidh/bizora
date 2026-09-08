"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BUSINESS_SIZES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

interface BusinessSizeStepProps {
  value: "solo" | "small" | "medium" | "large";
  onSelect: (size: "solo" | "small" | "medium" | "large") => void;
  onBack: () => void;
}

export function BusinessSizeStep({ value, onSelect, onBack }: BusinessSizeStepProps) {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Business size</CardTitle>
        <CardDescription>
          This helps us customize your experience
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          {BUSINESS_SIZES.map((size) => (
            <button
              key={size.value}
              onClick={() => onSelect(size.value)}
              className={cn(
                "flex items-center gap-4 rounded-lg border-2 p-4 text-left transition-all hover:border-primary/50",
                value === size.value
                  ? "border-primary bg-primary/5"
                  : "border-transparent bg-muted/30"
              )}
            >
              <div>
                <div className="font-medium">{size.label}</div>
                <div className="text-sm text-muted-foreground">{size.description}</div>
              </div>
            </button>
          ))}
        </div>
        <Button type="button" variant="outline" onClick={onBack} className="w-full">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </CardContent>
    </Card>
  );
}
