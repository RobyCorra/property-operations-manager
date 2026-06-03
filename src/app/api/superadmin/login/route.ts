import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const secret = (formData.get("secret") as string ?? "").trim();
  const expected = (process.env.SUPERADMIN_SECRET ?? "").trim();

  if (!expected) {
    return NextResponse.json({ error: "SUPERADMIN_SECRET non configurata." }, { status: 500 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? req.headers.get("x-real-ip") ?? undefined;

  if (!secret || secret !== expected) {
    try { await prisma.superAdminLog.create({ data: { id: `${Date.now()}-err`, action: "LOGIN_FALLITO", detail: "Password errata", ip } }); } catch {}
    return NextResponse.json({ error: "Password non valida." }, { status: 401 });
  }

  try { await prisma.superAdminLog.create({ data: { id: `${Date.now()}-ok`, action: "LOGIN", detail: "Accesso al pannello superadmin", ip } }); } catch {}

  const res = NextResponse.redirect(new URL("/superadmin", req.url));
  res.cookies.set("superadmin_token", expected, {
    path: "/",
    maxAge: 60 * 60 * 8,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  return res;
}
