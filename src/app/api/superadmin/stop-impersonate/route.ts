import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export async function POST(req: NextRequest) {
  const orgId = req.cookies.get("impersonating")?.value;
  if (orgId) {
    try {
      const org = await prisma.organization.findUnique({ where: { id: orgId }, select: { name: true } });
      await prisma.superAdminLog.create({
        data: {
          id: `${Date.now()}-impstop`,
          action: "FINE_IMPERSONA",
          detail: `Terminata impersonazione`,
          orgId,
          orgName: org?.name ?? null,
          ip: req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? req.headers.get("x-real-ip") ?? null,
        },
      });
    } catch (e) { console.error("[SuperAdminLog] stop-impersonate log error:", e); }
  }

  const res = NextResponse.redirect(new URL("/superadmin", req.url));
  for (const name of ["role", "userId", "userName", "organizationId", "impersonating"]) {
    res.cookies.set(name, "", { path: "/", maxAge: 0 });
  }
  return res;
}
