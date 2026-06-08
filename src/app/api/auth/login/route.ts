import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/src/lib/prisma";

const ROLE_REDIRECT: Record<string, string> = {
  MANAGER: "/dashboard/manager",
  CLEANER: "/dashboard/cleaner",
  MAINTENANCE: "/dashboard/maintenance",
  SUPERVISOR: "/dashboard/supervisor",
  OWNER: "/dashboard/owner",
};

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const email = ((formData.get("email") as string) ?? "").trim().toLowerCase();
  const password = (formData.get("password") as string) ?? "";

  if (!email || !password) {
    return NextResponse.redirect(new URL("/login?error=required", req.url), { status: 303 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: { organization: { select: { id: true, name: true } } },
  });

  if (!user) {
    try {
      await prisma.superAdminLog.create({
        data: { action: "LOGIN_FALLITO", detail: `Email non trovata: ${email}` },
      });
    } catch (e) { console.error("[Log] login_fallito:", e); }
    return NextResponse.redirect(new URL("/login?error=invalid", req.url), { status: 303 });
  }

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    try {
      await prisma.superAdminLog.create({
        data: {
          action: "LOGIN_FALLITO",
          detail: `Password errata: ${user.name} (${email})`,
          orgId: user.organization?.id ?? null,
          orgName: user.organization?.name ?? null,
        },
      });
    } catch (e) { console.error("[Log] login_fallito:", e); }
    return NextResponse.redirect(new URL("/login?error=invalid", req.url), { status: 303 });
  }

  // Log successful login
  try {
    await prisma.superAdminLog.create({
      data: {
        action: `LOGIN_${user.role}`,
        detail: `${user.name} (${email})`,
        orgId: user.organization?.id ?? null,
        orgName: user.organization?.name ?? null,
        ip: req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? req.headers.get("x-real-ip") ?? null,
      },
    });
  } catch (e) { console.error("[Log] login_ok:", e); }

  const destination = ROLE_REDIRECT[user.role] ?? "/dashboard/manager";
  const res = NextResponse.redirect(new URL(destination, req.url), { status: 303 });
  const opts = {
    path: "/",
    maxAge: 60 * 60 * 24,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
  };
  res.cookies.set("role", user.role, opts);
  res.cookies.set("userId", user.id, opts);
  res.cookies.set("userName", encodeURIComponent(user.name), opts);
  res.cookies.set("organizationId", user.organization?.id ?? "org_default", opts);
  return res;
}
