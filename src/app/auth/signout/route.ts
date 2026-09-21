import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // Client also signs out locally — server failure must not trap the user.
  }
  // Plain JSON: no env dependency, no redirect for fetch to chase.
  return NextResponse.json({ ok: true });
}
