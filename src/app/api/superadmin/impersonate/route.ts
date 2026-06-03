import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("superadmin_token")?.value?.trim();
  const expected = (process.env.SUPERADMIN_SECRET ?? "").trim();
  if (!expected || token !== expected) {
    return NextResponse.redirect(new URL("/superadmin/login", req.url));
  }

  const formData = await req.formData();
  const orgId = formData.get("orgId") as string;

  const [manager, org] = await Promise.all([
    prisma.user.findFirst({ where: { organizationId: orgId, role: "MANAGER" } }),
    prisma.organization.findUnique({ where: { id: orgId }, select: { name: true } }),
  ]);
  if (!manager) {
    return NextResponse.redirect(new URL("/superadmin", req.url));
  }

  try { await prisma.superAdminLog.create({ data: { id: `${Date.now()}-imp`, action: "IMPERSONA", detail: `Manager: ${manager.name} (${manager.email})`, orgId, orgName: org?.name ?? undefined } }); } catch {}

  const res = NextResponse.redirect(new URL("/dashboard/manager", req.url));
  const opts = { path: "/", maxAge: 60 * 60 * 24, httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const };
  res.cookies.set("role", "MANAGER", opts);
  res.cookies.set("userId", manager.id, opts);
  res.cookies.set("userName", manager.name, opts);
  res.cookies.set("organizationId", orgId, opts);
  res.cookies.set("impersonating", orgId, opts);
  return res;
}
