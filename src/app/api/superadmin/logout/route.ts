import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const res = NextResponse.redirect(new URL("/superadmin/login", req.url));
  res.cookies.set("superadmin_token", "", { path: "/", maxAge: 0 });
  return res;
}
