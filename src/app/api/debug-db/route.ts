import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.DATABASE_URL ?? "";
  // Show only the host part, no credentials
  const masked = url.replace(/:\/\/[^@]+@/, "://***@");
  return NextResponse.json({ dbUrl: masked });
}
