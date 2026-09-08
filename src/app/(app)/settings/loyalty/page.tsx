"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useBusiness } from "@/lib/store";
import { getLoyaltySettings, updateLoyaltySettings, type LoyaltySettings } from "@/server/actions/loyalty";
import { Gift, Save, Loader2, Star, Award, Settings } from "lucide-react";

export default function LoyaltySettingsPage() {
  const { businessId } = useBusiness();
  const [settings, setSettings] = useState<LoyaltySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!businessId) return;
    getLoyaltySettings(businessId).then((s) => {
      setSettings(s);
      setLoading(false);
    });
  }, [businessId]);

  const handleSave = async () => {
    if (!businessId || !settings) return;
    setSaving(true);
    try {
      await updateLoyaltySettings(businessId, {
        enabled: settings.enabled,
        earn_rate: settings.earn_rate,
        earn_points: settings.earn_points,
        redeem_rate: settings.redeem_rate,
        min_redeem_points: settings.min_redeem_points,
        max_discount_percent: settings.max_discount_percent,
        welcome_bonus: settings.welcome_bonus,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Loyalty Program</h1>
        <p className="text-muted-foreground">Configure how customers earn and redeem points</p>
      </div>

      {/* Enable/Disable */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Gift className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Loyalty Program</h3>
                <p className="text-sm text-muted-foreground">
                  {settings.enabled ? "Active — customers earn points on purchases" : "Disabled"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSettings({ ...settings, enabled: !settings.enabled })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.enabled ? "bg-primary" : "bg-muted"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.enabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      {settings.enabled && (
        <>
          {/* Earn Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Star className="h-4 w-4 text-warning" />
                How Customers Earn Points
              </CardTitle>
              <CardDescription>Set how many points customers earn per rupee spent</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="earn_rate">Spend ₹(amount)</Label>
                  <Input
                    id="earn_rate"
                    type="number"
                    min={1}
                    value={settings.earn_rate}
                    onChange={(e) => setSettings({ ...settings, earn_rate: Number(e.target.value) })}
                  />
                  <p className="text-xs text-muted-foreground">Customer must spend this much</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="earn_points">To earn (points)</Label>
                  <Input
                    id="earn_points"
                    type="number"
                    min={1}
                    value={settings.earn_points}
                    onChange={(e) => setSettings({ ...settings, earn_points: Number(e.target.value) })}
                  />
                  <p className="text-xs text-muted-foreground">Points they receive</p>
                </div>
              </div>
              <div className="rounded-lg bg-muted/50 p-3 text-sm">
                <span className="text-muted-foreground">Example: </span>
                <span className="font-medium">
                  Spend ₹{settings.earn_rate} = Earn {settings.earn_points} point{settings.earn_points > 1 ? "s" : ""}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Redeem Settings */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Award className="h-4 w-4 text-success" />
                How Customers Redeem Points
              </CardTitle>
              <CardDescription>Set the value of each point and minimum redemption</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="redeem_rate">1 Point = ₹(value)</Label>
                  <Input
                    id="redeem_rate"
                    type="number"
                    min={1}
                    value={settings.redeem_rate}
                    onChange={(e) => setSettings({ ...settings, redeem_rate: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="min_points">Min. points to redeem</Label>
                  <Input
                    id="min_points"
                    type="number"
                    min={1}
                    value={settings.min_redeem_points}
                    onChange={(e) => setSettings({ ...settings, min_redeem_points: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_discount">Max discount % per bill</Label>
                <Input
                  id="max_discount"
                  type="number"
                  min={1}
                  max={100}
                  value={settings.max_discount_percent}
                  onChange={(e) => setSettings({ ...settings, max_discount_percent: Number(e.target.value) })}
                />
              </div>
              <div className="rounded-lg bg-muted/50 p-3 text-sm">
                <span className="text-muted-foreground">Example: </span>
                <span className="font-medium">
                  {settings.min_redeem_points} points = ₹{settings.min_redeem_points * settings.redeem_rate} discount
                </span>
                <span className="text-muted-foreground"> (max {settings.max_discount_percent}% of bill)</span>
              </div>
            </CardContent>
          </Card>

          {/* Welcome Bonus */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Gift className="h-4 w-4 text-primary" />
                Welcome Bonus
              </CardTitle>
              <CardDescription>Give new customers bonus points on signup</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="welcome">Bonus points for new customers</Label>
                <Input
                  id="welcome"
                  type="number"
                  min={0}
                  value={settings.welcome_bonus}
                  onChange={(e) => setSettings({ ...settings, welcome_bonus: Number(e.target.value) })}
                />
                <p className="text-xs text-muted-foreground">Set to 0 for no welcome bonus</p>
              </div>
            </CardContent>
          </Card>

          {/* Save */}
          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Loyalty Settings
          </Button>
        </>
      )}
    </div>
  );
}
