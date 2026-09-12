import { NextResponse } from "next/server";
export async function GET() {
  throw new Error("Sentry example error");
}
