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
  const companyId = formData.get("companyId") as string;
  const opts = { path: "/", maxAge: 60 * 60 * 24, httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const };
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? req.headers.get("x-real-ip") ?? null;

  // Impersonazione manager impresa
  if (companyId) {
    const [manager, company] = await Promise.all([
      prisma.user.findFirst({ where: { companyId, role: "MANAGER" } }),
      prisma.company.findUnique({ where: { id: companyId }, select: { name: true } }),
    ]);
    if (!manager) return NextResponse.redirect(new URL("/superadmin", req.url));
    try {
      await prisma.superAdminLog.create({
        data: {
          id: `${Date.now()}-impc`,
          action: "IMPERSONA_IMPRESA",
          detail: `Impresa: ${company?.name ?? companyId} · Manager: ${manager.name} (${manager.email})`,
          ip,
        },
      });
    } catch (e) { console.error("[SuperAdminLog] impersonate company log error:", e); }

    const res = NextResponse.redirect(new URL("/dashboard/impresa", req.url), { status: 303 });
    res.cookies.set("role", "MANAGER", opts);
    res.cookies.set("userId", manager.id, opts);
    res.cookies.set("userName", encodeURIComponent(manager.name), opts);
    res.cookies.set("organizationId", "", opts);
    res.cookies.set("companyId", companyId, opts);
    res.cookies.set("impersonating", companyId, opts);
    return res;
  }

  const [manager, org] = await Promise.all([
    prisma.user.findFirst({ where: { organizationId: orgId, role: "MANAGER" } }),
    prisma.organization.findUnique({ where: { id: orgId }, select: { name: true } }),
  ]);
  if (!manager) {
    return NextResponse.redirect(new URL("/superadmin", req.url));
  }

  try {
    await prisma.superAdminLog.create({
      data: {
        id: `${Date.now()}-imp`,
        action: "IMPERSONA",
        detail: `Manager: ${manager.name} (${manager.email})`,
        orgId,
        orgName: org?.name ?? null,
        ip,
      },
    });
  } catch (e) { console.error("[SuperAdminLog] impersonate log error:", e); }

  const res = NextResponse.redirect(new URL("/dashboard/manager", req.url), { status: 303 });
  res.cookies.set("role", "MANAGER", opts);
  res.cookies.set("userId", manager.id, opts);
  res.cookies.set("userName", encodeURIComponent(manager.name), opts);
  res.cookies.set("organizationId", orgId, opts);
  res.cookies.set("companyId", "", opts);
  res.cookies.set("impersonating", orgId, opts);
  return res;
}
