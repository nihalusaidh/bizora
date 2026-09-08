"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GST_STATUS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { ArrowLeft, Check } from "lucide-react";

interface GstStepProps {
  status: "registered" | "unregistered";
  gstin: string;
  onSelect: (status: "registered" | "unregistered", gstin?: string) => void;
  onBack: () => void;
}

export function GstStep({ status, gstin, onSelect, onBack }: GstStepProps) {
  const [selectedStatus, setSelectedStatus] = useState(status);
  const [gstinValue, setGstinValue] = useState(gstin);

  const handleContinue = () => {
    if (selectedStatus === "unregistered") {
      onSelect("unregistered");
    } else if (gstinValue.trim().length >= 15) {
      onSelect("registered", gstinValue.trim());
    }
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">GST Registration</CardTitle>
        <CardDescription>
          Is your business registered for GST?
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {GST_STATUS.map((s) => (
            <button
              key={s.value}
              onClick={() => setSelectedStatus(s.value as "registered" | "unregistered")}
              className={cn(
                "flex items-center gap-3 w-full rounded-lg border-2 p-4 text-left transition-all hover:border-primary/50",
                selectedStatus === s.value
                  ? "border-primary bg-primary/5"
                  : "border-transparent bg-muted/30"
              )}
            >
              <div className={cn(
                "h-5 w-5 rounded-full border-2 flex items-center justify-center",
                selectedStatus === s.value ? "border-primary" : "border-muted-foreground/30"
              )}>
                {selectedStatus === s.value && (
                  <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                )}
              </div>
              <div>
                <div className="font-medium">{s.label}</div>
                <div className="text-sm text-muted-foreground">{s.description}</div>
              </div>
            </button>
          ))}
        </div>

        {selectedStatus === "registered" && (
          <div className="space-y-2">
            <Label htmlFor="gstin">GSTIN Number</Label>
            <Input
              id="gstin"
              placeholder="e.g. 22AAAAA0000A1Z5"
              value={gstinValue}
              onChange={(e) => setGstinValue(e.target.value.toUpperCase())}
              maxLength={15}
            />
            <p className="text-xs text-muted-foreground">
              Enter your 15-digit GST Identification Number
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onBack} className="flex-1">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            type="button"
            onClick={handleContinue}
            className="flex-1"
            disabled={selectedStatus === "registered" && gstinValue.trim().length < 15}
          >
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
