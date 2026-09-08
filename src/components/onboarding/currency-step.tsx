"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CURRENCIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ArrowLeft, Check } from "lucide-react";

interface CurrencyStepProps {
  currency: string;
  currencySymbol: string;
  onSelect: (currency: string, symbol: string) => void;
  onBack: () => void;
}

export function CurrencyStep({ currency, onSelect, onBack }: CurrencyStepProps) {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Select your currency</CardTitle>
        <CardDescription>
          Choose the currency you use for business
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-2">
          {CURRENCIES.map((c) => (
            <button
              key={c.code}
              onClick={() => onSelect(c.code, c.symbol)}
              className={cn(
                "flex items-center gap-3 rounded-lg border-2 p-3 text-left transition-all hover:border-primary/50",
                currency === c.code
                  ? "border-primary bg-primary/5"
                  : "border-transparent bg-muted/30"
              )}
            >
              <span className="text-xl font-bold w-8">{c.symbol}</span>
              <div className="flex-1">
                <span className="font-medium">{c.name}</span>
                <span className="ml-2 text-muted-foreground">({c.code})</span>
              </div>
              {currency === c.code && (
                <Check className="h-5 w-5 text-primary" />
              )}
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
