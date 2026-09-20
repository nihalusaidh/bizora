"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Zap } from "lucide-react";

interface BusinessNameStepProps {
  value: string;
  onSubmit: (name: string) => void;
  onExpress?: (name: string) => void;
  onBack: () => void;
}

export function BusinessNameStep({ value, onSubmit, onExpress, onBack }: BusinessNameStepProps) {
  const [name, setName] = useState(value);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length >= 2) {
      onSubmit(name.trim());
    }
  };

  const handleExpress = () => {
    if (name.trim().length >= 2) {
      onExpress?.(name.trim());
    }
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">What&apos;s your business called?</CardTitle>
        <CardDescription>
          This will appear on invoices and receipts
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name</Label>
            <Input
              id="businessName"
              placeholder="e.g. ABC Stores"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onBack} className="flex-1">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button type="submit" className="flex-1" disabled={name.trim().length < 2}>
              Continue
            </Button>
          </div>
          {onExpress && (
            <Button
              type="button"
              variant="red"
              className="w-full"
              disabled={name.trim().length < 2}
              onClick={handleExpress}
            >
              <Zap className="mr-2 h-4 w-4" />
              Express setup — finish in 10 seconds
            </Button>
          )}
          {onExpress && (
            <p className="text-center text-xs text-muted-foreground">
              Uses recommended defaults (INR, unregistered, small). Change anytime in Settings.
            </p>
          )}
        </CardContent>
      </form>
    </Card>
  );
}
