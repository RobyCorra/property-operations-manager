import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const secret = (formData.get("secret") as string ?? "").trim();
  const expected = (process.env.SUPERADMIN_SECRET ?? "").trim();

  if (!expected) {
    return NextResponse.json({ error: "SUPERADMIN_SECRET non configurata." }, { status: 500 });
  }

  if (!secret || secret !== expected) {
    await prisma.superAdminLog.create({ data: { id: `${Date.now()}-err`, action: "LOGIN_FALLITO", ip: req.headers.get("x-forwarded-for") ?? undefined } });
    return NextResponse.json({ error: "Password non valida." }, { status: 401 });
  }

  await prisma.superAdminLog.create({ data: { id: `${Date.now()}-ok`, action: "LOGIN", ip: req.headers.get("x-forwarded-for") ?? undefined } });

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
