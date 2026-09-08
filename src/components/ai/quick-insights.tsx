"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getQuickInsights } from "@/server/actions/ai";
import { useBusiness } from "@/lib/store";
import { Sparkles, RefreshCw, Loader2 } from "lucide-react";

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
    } catch {
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
          <Sparkles className="h-4 w-4 text-[#DC2626]" />
          BIZORA BRIEF
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
          <div className="space-y-3">
            {insights.map((insight, i) => (
              <div key={i} className="flex items-start gap-2.5 text-sm">
                <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#DC2626] shrink-0" />
                <span className="text-muted-foreground">{insight.replace(/^[-•*]\s*/, "")}</span>
              </div>
            ))}
          </div>
        )}
        <div className="mt-3 pt-3 border-t border-border">
          <a href="/insights" className="text-xs font-medium text-foreground hover:text-[#DC2626] transition-colors">
            View insights →
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
