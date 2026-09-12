"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Lock, Fingerprint, Eye, EyeOff } from "lucide-react";

const PASSCODE_KEY = "bizora_passcode";
const PASSCODE_HASH_KEY = "bizora_passcode_hash";

async function hashPasscode(code: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(code + "_bizora_salt");
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function PasscodeLock({ onUnlock }: { onUnlock: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const [showPasscode, setShowPasscode] = useState(false);

  const handleUnlock = useCallback(async () => {
    const stored = localStorage.getItem(PASSCODE_HASH_KEY);
    if (!stored) { onUnlock(); return; }
    const hash = await hashPasscode(code);
    if (hash === stored) {
      onUnlock();
    } else {
      setError(true);
      setCode("");
      setTimeout(() => setError(false), 1000);
    }
  }, [code, onUnlock]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background">
      <Card className="w-80">
        <CardHeader className="text-center">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-lg">BIZORA Locked</CardTitle>
          <p className="text-sm text-muted-foreground">Enter passcode to unlock</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Input
              type={showPasscode ? "text" : "password"}
              placeholder="Enter passcode"
              value={code}
              onChange={(e) => { setCode(e.target.value); setError(false); }}
              onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
              className={`text-center text-lg tracking-widest h-12 ${error ? "border-[#DC2626] animate-shake" : ""}`}
              autoFocus
              maxLength={8}
            />
            <Button variant="ghost" size="icon" className="absolute right-1 top-1 h-10 w-10" onClick={() => setShowPasscode(!showPasscode)}>
              {showPasscode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          <Button onClick={handleUnlock} disabled={!code} className="w-full">Unlock</Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function PasscodeSetup({ onComplete }: { onComplete: () => void }) {
  const [code, setCode] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const handleSet = async () => {
    if (code.length < 4) { setError("Passcode must be at least 4 digits"); return; }
    if (code !== confirm) { setError("Passcodes don't match"); return; }
    const hash = await hashPasscode(code);
    localStorage.setItem(PASSCODE_HASH_KEY, hash);
    localStorage.setItem(PASSCODE_KEY, "enabled");
    onComplete();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2"><Lock className="h-4 w-4" /> Set App Passcode</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {error && <p className="text-sm text-[#DC2626]">{error}</p>}
        <div className="space-y-2">
          <Label>Passcode</Label>
          <Input type="password" placeholder="Min 4 digits" value={code} onChange={(e) => setCode(e.target.value)} className="tracking-widest" maxLength={8} />
        </div>
        <div className="space-y-2">
          <Label>Confirm Passcode</Label>
          <Input type="password" placeholder="Re-enter passcode" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="tracking-widest" maxLength={8} />
        </div>
        <Button onClick={handleSet} disabled={!code || !confirm} className="w-full">Set Passcode</Button>
      </CardContent>
    </Card>
  );
}

export function isPasscodeEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(PASSCODE_KEY) === "enabled";
}

export function removePasscode() {
  localStorage.removeItem(PASSCODE_KEY);
  localStorage.removeItem(PASSCODE_HASH_KEY);
}
