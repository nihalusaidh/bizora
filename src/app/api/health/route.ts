import { NextResponse } from "next/server";
import { missingServerKeys } from "@/lib/supabase/admin";

/**
 * Deployment health check — reports which required env keys are present.
 * Returns presence booleans ONLY, never secret values.
 * Visit https://<your-domain>/api/health to verify a deploy.
 */
export async function GET() {
  const missing = missingServerKeys();
  const optional = {
    payments: !!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID && !!process.env.RAZORPAY_KEY_SECRET,
    ai: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "your-gemini-api-key-here",
    email: !!process.env.RESEND_API_KEY,
    push: !!process.env.NEXT_PUBLIC_VAPID_KEY,
  };
  return NextResponse.json({
    ok: missing.length === 0,
    build: "2026-09-20-batch",
    databaseKeys: {
      NEXT_PUBLIC_SUPABASE_URL: !missing.includes("NEXT_PUBLIC_SUPABASE_URL"),
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !missing.includes("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
      SUPABASE_SERVICE_ROLE_KEY: !missing.includes("SUPABASE_SERVICE_ROLE_KEY"),
    },
    missing,
    optional,
  });
}
