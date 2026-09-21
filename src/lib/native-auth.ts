import { Capacitor } from "@capacitor/core";
import { createClient } from "@/lib/supabase/client";
import { isCapacitor } from "@/lib/platform";

/** Custom scheme the Android app claims via AndroidManifest intent-filter. */
export const NATIVE_AUTH_REDIRECT = "app.bizora.operating://auth/callback";

/** Friendly error telling the user their installed APK is too old. */
function outdatedAppError(): Error {
  return new Error(
    "Please update BIZORA from the Download page, then try again. (In-app sign-in needs the latest app version.)"
  );
}

/**
 * Google sign-in that stays inside the installed app:
 * opens the system browser (Custom Tab) for Google, then the OAuth
 * redirect deep-links back into the app where we exchange the code.
 * Must add NATIVE_AUTH_REDIRECT to Supabase Auth → URL Configuration.
 */
export async function signInWithGoogleNative(): Promise<void> {
  if (!isCapacitor()) throw new Error("Native auth is only available in the app.");

  // Old installed APKs lack the Browser/App plugins — fail fast with guidance
  // instead of the raw "plugin is not implemented on android" error.
  if (!Capacitor.isPluginAvailable("Browser") || !Capacitor.isPluginAvailable("App")) {
    throw outdatedAppError();
  }

  const [{ App }, { Browser }] = await Promise.all([
    import("@capacitor/app"),
    import("@capacitor/browser"),
  ]);

  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: NATIVE_AUTH_REDIRECT,
      skipBrowserRedirect: true,
    },
  });
  if (error || !data?.url) throw error || new Error("Could not start Google sign-in.");

  await new Promise<void>((resolve, reject) => {
    let done = false;
    const finish = (fn: () => void) => {
      if (done) return;
      done = true;
      try {
        fn();
      } catch {
        // Listener cleanup is best-effort.
      }
    };

    let listener: { remove: () => void } | null = null;
    const timeout = setTimeout(() => {
      finish(() => {
        listener?.remove();
        Browser.close().catch(() => {});
        reject(new Error("Google sign-in timed out. Please try again."));
      });
    }, 120000);

    App.addListener("appUrlOpen", async (event) => {
      clearTimeout(timeout);
      finish(() => listener?.remove());
      try {
        await Browser.close().catch(() => {});
        const url = new URL(event.url);
        const code = url.searchParams.get("code");
        const err = url.searchParams.get("error_description") || url.searchParams.get("error");
        if (err) throw new Error(err);
        if (!code) throw new Error("Google sign-in was cancelled.");
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) throw exchangeError;
        resolve();
      } catch (e) {
        reject(e instanceof Error ? e : new Error("Google sign-in failed."));
      }
    }).then((h) => {
      listener = h;
    });

    Browser.open({ url: data.url, presentationStyle: "popover" }).catch((e) => {
      clearTimeout(timeout);
      finish(() => listener?.remove());
      reject(e instanceof Error ? e : new Error("Could not open browser."));
    });
  });
}

/** Map raw Capacitor bridge errors to the update prompt. */
export function friendlyNativeError(e: unknown): Error {
  const msg = e instanceof Error ? e.message : String(e ?? "");
  if (/not implemented on/i.test(msg)) return outdatedAppError();
  return e instanceof Error ? e : new Error("Google sign-in failed.");
}

/** Route after native OAuth: existing business → dashboard, new user → onboarding. */
export async function nextAfterAuth(): Promise<string> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return "/login";
    const { data } = await supabase
      .from("memberships")
      .select("business_id")
      .eq("user_id", user.id)
      .limit(1);
    return data && data.length > 0 ? "/dashboard" : "/onboarding";
  } catch {
    return "/dashboard";
  }
}
