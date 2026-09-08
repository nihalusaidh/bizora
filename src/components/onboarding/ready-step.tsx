"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Check, Package, Receipt } from "lucide-react";

interface ReadyStepProps {
  businessName: string;
  onComplete: () => void;
  loading: boolean;
}

export function ReadyStep({ businessName, onComplete, loading }: ReadyStepProps) {
  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Check className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-xl">
          Your Bizora workspace is ready!
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <p className="text-muted-foreground">
            <strong>{businessName}</strong> is set up and ready to go.
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Recommended next steps:</h3>
          <div className="rounded-lg border bg-muted/30 p-3 flex items-center gap-3">
            <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
              <Package className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Add your first product</p>
              <p className="text-xs text-muted-foreground">Create products to start billing</p>
            </div>
          </div>
          <div className="rounded-lg border bg-muted/30 p-3 flex items-center gap-3">
            <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
              <Receipt className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Create your first bill</p>
              <p className="text-xs text-muted-foreground">Start billing customers</p>
            </div>
          </div>
        </div>

        <Button
          onClick={onComplete}
          className="w-full"
          size="lg"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Setting up...
            </>
          ) : (
            "Go to Dashboard"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
