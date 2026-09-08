"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BUSINESS_TYPES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface BusinessTypeStepProps {
  value: string;
  onSelect: (type: string) => void;
}

export function BusinessTypeStep({ value, onSelect }: BusinessTypeStepProps) {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Tell us about your business</CardTitle>
        <CardDescription>
          Choose the type that best describes your business
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {BUSINESS_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => onSelect(type.value)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all hover:border-primary/50 hover:bg-primary/5",
                value === type.value
                  ? "border-primary bg-primary/10"
                  : "border-transparent bg-muted/30"
              )}
            >
              <span className="text-2xl">{type.icon}</span>
              <span className="text-sm font-medium">{type.label}</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
