"use server";

import { requireBusiness } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Creates a single-use login link for a second device/browser.
 * The logged-in mobile app shows it as a QR code; scanning it with the
 * phone camera opens the website already signed in. Links expire and
 * cannot be reused — never share one publicly.
 */
export async function createBrowserLoginLink(): Promise<{ link?: string; error?: string }> {
  const auth = await requireBusiness();
  if (auth.error || !auth.supabase || !auth.user) {
    return { error: "Not signed in. Please log in again." };
  }

  const email = auth.user.email;
  if (!email) {
    return { error: "This login method needs an email on your account." };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) {
    return { error: "Server is misconfigured (missing app URL). Contact support." };
  }

  try {
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { redirectTo: `${appUrl}/auth/callback?next=/dashboard` },
    });
    if (error || !data?.properties?.action_link) {
      return { error: error?.message || "Could not create login link." };
    }
    return { link: data.properties.action_link as string };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Something went wrong";
    if (msg.startsWith("Server is misconfigured")) return { error: msg };
    if (/supabaseKey is required|supabaseUrl is required/i.test(msg)) {
      return { error: "Server is misconfigured (database key missing). Contact support." };
    }
    return { error: msg };
  }
}
