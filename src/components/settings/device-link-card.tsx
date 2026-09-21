"use client";

import { useState } from "react";
import QRCode from "qrcode";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { isCapacitor } from "@/lib/platform";
import { createBrowserLoginLink } from "@/server/actions/device-link";
import { MonitorSmartphone, Copy, Check, Loader2, RefreshCw } from "lucide-react";

/**
 * Shown only inside the installed app: generates a single-use QR that
 * logs the website browser in without typing email + password.
 * (App and browser keep separate sessions — this bridges them.)
 */
export function DeviceLinkCard() {
  const [isNative] = useState(() => isCapacitor());
  const [qr, setQr] = useState("");
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  if (!isNative) return null;

  const generate = async () => {
    setLoading(true);
    setError("");
    setCopied(false);
    try {
      const result = await createBrowserLoginLink();
      if (result.error || !result.link) {
        setError(result.error || "Could not create login link.");
        return;
      }
      setLink(result.link);
      setQr(await QRCode.toDataURL(result.link, { width: 220, margin: 2 }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create login link.");
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Copy failed — long-press the QR screen instead.");
    }
  };

  return (
    <Card className="border-red-100 bg-white">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-[#FEF2F2] border border-red-100 flex items-center justify-center shrink-0">
            <MonitorSmartphone className="h-5 w-5 text-[#DC2626]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold">Use on this browser too?</h3>
            <p className="text-xs text-muted-foreground">
              The app and browser log in separately. Scan to sign the browser in instantly.
            </p>
          </div>
        </div>

        {qr ? (
          <div className="mt-3 text-center space-y-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qr} alt="Browser login QR" className="mx-auto h-44 w-44 rounded-lg border border-red-100" />
            <p className="text-xs text-muted-foreground">
              Scan with your phone camera → opens the site signed in. Single-use, expires soon.
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" size="sm" onClick={copy}>
                {copied ? <Check className="mr-1 h-4 w-4" /> : <Copy className="mr-1 h-4 w-4" />}
                {copied ? "Copied!" : "Copy link"}
              </Button>
              <Button variant="ghost" size="sm" onClick={generate} disabled={loading}>
                <RefreshCw className="mr-1 h-4 w-4" />
                New code
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="red" className="w-full mt-3" onClick={generate} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MonitorSmartphone className="mr-2 h-4 w-4" />}
            {loading ? "Creating secure code..." : "Link a browser"}
          </Button>
        )}
        {error && <p className="text-xs font-bold text-[#DC2626] mt-2">{error}</p>}
      </CardContent>
    </Card>
  );
}
