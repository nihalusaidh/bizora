"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PasscodeSetup, isPasscodeEnabled, removePasscode } from "@/components/providers/passcode-lock";
import { ArrowLeft, Lock, Shield, Trash2 } from "lucide-react";

export default function SecurityPage() {
  const [passcodeOn, setPasscodeOn] = useState(isPasscodeEnabled());
  const [showSetup, setShowSetup] = useState(false);

  const togglePasscode = () => {
    if (passcodeOn) {
      removePasscode();
      setPasscodeOn(false);
      setShowSetup(false);
    } else {
      setShowSetup(true);
    }
  };

  const handleSetupComplete = () => {
    setPasscodeOn(true);
    setShowSetup(false);
  };

  return (
    <div className="space-y-6 max-w-lg">
      <div className="flex items-center gap-3">
        <Link href="/settings" className="inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-accent h-8 w-8">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Security</h1>
          <p className="text-muted-foreground">App lock and security settings</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label className="font-medium">Passcode Lock</Label>
                <p className="text-xs text-muted-foreground">Require passcode to open app</p>
              </div>
            </div>
            <Switch checked={passcodeOn} onCheckedChange={togglePasscode} />
          </div>
        </CardContent>
      </Card>

      {showSetup && <PasscodeSetup onComplete={handleSetupComplete} />}

      {passcodeOn && !showSetup && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-foreground" />
                <div>
                  <p className="text-sm font-medium">Passcode is active</p>
                  <p className="text-xs text-muted-foreground">App will ask for passcode on launch</p>
                </div>
              </div>
              <Button variant="destructive" size="sm" onClick={togglePasscode}>
                <Trash2 className="mr-2 h-4 w-4" />Remove
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
