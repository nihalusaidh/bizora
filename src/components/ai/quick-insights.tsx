"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getQuickInsights } from "@/server/actions/ai";
import { useBusiness } from "@/lib/store";
import { Sparkles, RefreshCw, Loader2, TrendingUp } from "lucide-react";

export function QuickInsights() {
  const { businessId } = useBusiness();
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const loadInsights = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const data = await getQuickInsights(businessId);
      setInsights(data);
    } catch (err) {
      console.error("Failed to load insights:", err);
      setInsights(["Unable to load insights. Please try again."]);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          AI Insights
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={loadInsights}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {loading && insights.length === 0 ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-4 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {insights.map((insight, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <TrendingUp className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                <span className="text-muted-foreground">{insight.replace(/^[-•*]\s*/, "")}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
