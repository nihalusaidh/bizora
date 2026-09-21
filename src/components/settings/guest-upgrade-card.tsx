"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Loader2, CheckCircle } from "lucide-react";

/**
 * Guests entered without login. This card converts the anonymous account
 * into a permanent one (same user id — business data is kept).
 * Shown only for anonymous sessions.
 */
export function GuestUpgradeCard() {
  const [isGuest, setIsGuest] = useState(false);
  const [checked, setChecked] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data: { user } }) => {
        setIsGuest(!!user?.is_anonymous);
        setChecked(true);
      })
      .catch(() => setChecked(true));
  }, []);

  if (!checked || !isGuest) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ email, password });
      if (updateError) throw updateError;
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save account.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <Card className="border-red-100 bg-white">
        <CardContent className="p-4 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-[#DC2626] shrink-0" />
          <p className="text-sm">
            <span className="font-bold">Account saved!</span>{" "}
            <span className="text-muted-foreground">If email confirmation is on, tap the link in your inbox — your data stays.</span>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-[#DC2626]/30 bg-gradient-to-br from-[#DC2626]/5 to-transparent">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-lg bg-[#DC2626]/10 flex items-center justify-center shrink-0">
            <UserPlus className="h-5 w-5 text-[#DC2626]" />
          </div>
          <div>
            <h3 className="text-sm font-bold">You&apos;re exploring as a guest</h3>
            <p className="text-xs text-muted-foreground">Add email + password to keep your data on every device.</p>
          </div>
        </div>
        <form onSubmit={handleSave} className="space-y-2">
          <div className="space-y-1">
            <Label htmlFor="guest-email">Email</Label>
            <Input
              id="guest-email"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="guest-password">Password</Label>
            <Input
              id="guest-password"
              type="password"
              required
              minLength={6}
              placeholder="Min 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          {error && <p className="text-xs font-bold text-[#DC2626]">{error}</p>}
          <Button type="submit" variant="red" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {loading ? "Saving..." : "Save my account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
