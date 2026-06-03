import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const res = NextResponse.redirect(new URL("/superadmin", req.url));
  for (const name of ["role", "userId", "userName", "organizationId", "impersonating"]) {
    res.cookies.set(name, "", { path: "/", maxAge: 0 });
  }
  return res;
}
