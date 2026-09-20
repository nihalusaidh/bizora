/** Map low-level failures to plain-language setup errors. Never leaks raw key errors. */
export function friendlySetupError(e: unknown, fallback = "Something went wrong. Please try again."): string {
  const msg = e instanceof Error ? e.message : String(e ?? "");
  if (msg.startsWith("Server is misconfigured")) return msg;
  if (/supabaseKey is required|supabaseUrl is required/i.test(msg)) {
    return "Server is misconfigured (database key missing). Contact support.";
  }
  return msg || fallback;
}
