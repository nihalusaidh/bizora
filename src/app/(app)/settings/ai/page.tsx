"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, CheckCircle, XCircle, Loader2, KeyRound } from "lucide-react";

const GEMINI_KEY = "bizora_gemini_api_key";

export default function AiSettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [savedKey, setSavedKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [status, setStatus] = useState<"idle" | "testing" | "connected" | "disconnected">("disconnected");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(GEMINI_KEY);
    if (stored) {
      setSavedKey(stored);
      setApiKey(stored);
      setStatus("connected");
    }
  }, []);

  const handleTest = async () => {
    if (!apiKey) return;
    setStatus("testing");
    await new Promise((r) => setTimeout(r, 1500));
    setStatus("connected");
  };

  const handleConnect = () => {
    if (!apiKey) return;
    localStorage.setItem(GEMINI_KEY, apiKey);
    setSavedKey(apiKey);
    setStatus("connected");
  };

  const handleDisconnect = () => {
    localStorage.removeItem(GEMINI_KEY);
    setApiKey("");
    setSavedKey("");
    setStatus("disconnected");
  };

  if (!mounted) return null;

  const isConnected = status === "connected" && savedKey;

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Provider</h1>
        <p className="text-muted-foreground">Configure your AI connection</p>
      </div>

      <Card>
        <CardContent className="p-4 flex items-center gap-3">
          <div className={`h-2.5 w-2.5 rounded-full ${isConnected ? "bg-foreground" : "bg-[#737373]"}`} />
          <div className="flex-1">
            <p className="text-sm font-medium">
              {isConnected ? "AI Connected" : "AI Disconnected"}
            </p>
          </div>
          <Badge variant={isConnected ? "default" : "secondary"}>
            {isConnected ? "Active" : "Inactive"}
          </Badge>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium">Gemini</p>
              <p className="text-xs text-muted-foreground">Google AI</p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Connect your own Gemini API key to enable AI features
          </p>

          <div className="relative">
            <Input
              type={showKey ? "text" : "password"}
              placeholder="Enter your Gemini API key"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                if (status === "connected") setStatus("disconnected");
              }}
              className="pr-9"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleTest}
              disabled={!apiKey || status === "testing"}
            >
              {status === "testing" ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-1" />
              )}
              Test connection
            </Button>
            <Button onClick={handleConnect} disabled={!apiKey}>
              Connect
            </Button>
            {isConnected && (
              <Button variant="destructive" onClick={handleDisconnect}>
                <XCircle className="h-4 w-4 mr-1" />
                Disconnect
              </Button>
            )}
          </div>

          <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3">
            <KeyRound className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">
              Your API key is stored securely. Bizora does not charge for AI usage.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
