"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_NAME } from "@/lib/constants";
import { Eye, EyeOff, Loader2, Monitor, Smartphone, Download, ArrowRight, CheckCircle2 } from "lucide-react";

type Step = "signup" | "platform";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("signup");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setStep("platform");
    setLoading(false);
  };

  const handlePlatformChoice = (platform: string) => {
    if (platform === "web") {
      router.push("/onboarding");
    } else if (platform === "desktop") {
      window.location.href = "/download";
    } else if (platform === "android") {
      window.location.href = "/download";
    }
  };

  if (step === "platform") {
    return (
      <Card className="max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Account Created!
          </CardTitle>
          <CardDescription>
            Welcome to {APP_NAME}. How would you like to use it?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Web */}
          <button
            onClick={() => handlePlatformChoice("web")}
            className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-border hover:border-[#DC2626] hover:bg-[#DC2626]/5 transition-all duration-200 text-left group"
          >
            <div className="h-12 w-12 rounded-lg bg-[#DC2626]/10 flex items-center justify-center shrink-0 group-hover:bg-[#DC2626]/20 transition-colors">
              <Monitor className="h-6 w-6 text-[#DC2626]" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Use on Web</h3>
              <p className="text-sm text-muted-foreground">Open in browser — no download needed</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-[#DC2626] transition-colors" />
          </button>

          {/* Desktop */}
          <button
            onClick={() => handlePlatformChoice("desktop")}
            className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-border hover:border-[#DC2626] hover:bg-[#DC2626]/5 transition-all duration-200 text-left group"
          >
            <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0 group-hover:bg-blue-500/20 transition-colors">
              <Download className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Download for Windows</h3>
              <p className="text-sm text-muted-foreground">Desktop app — works offline</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-[#DC2626] transition-colors" />
          </button>

          {/* Android */}
          <button
            onClick={() => handlePlatformChoice("android")}
            className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-border hover:border-[#DC2626] hover:bg-[#DC2626]/5 transition-all duration-200 text-left group"
          >
            <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0 group-hover:bg-green-500/20 transition-colors">
              <Smartphone className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Download for Android</h3>
              <p className="text-sm text-muted-foreground">Mobile app — scan barcodes on the go</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-[#DC2626] transition-colors" />
          </button>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-center text-muted-foreground w-full">
            You can always change this later in Settings
          </p>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">
          {APP_NAME}
        </CardTitle>
        <CardDescription>
          Create your free business account
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSignup}>
        <CardContent className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Your name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              autoComplete="name"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                disabled={loading}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              disabled={loading}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Free Account"
            )}
          </Button>
          <div className="text-sm text-center text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
