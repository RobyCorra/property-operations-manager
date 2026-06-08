"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/src/lib/prisma";

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email e password richiesti." };
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: { organization: { select: { id: true, name: true } } },
  });

  if (!user) {
    try {
      await prisma.superAdminLog.create({
        data: { id: `${Date.now()}-lf`, action: "LOGIN_FALLITO", detail: `Email non trovata: ${email}` },
      });
    } catch {}
    return { error: "Credenziali non valide." };
  }

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    try {
      await prisma.superAdminLog.create({
        data: {
          id: `${Date.now()}-lf`,
          action: "LOGIN_FALLITO",
          detail: `Password errata: ${user.name} (${email})`,
          orgId: user.organization?.id ?? null,
          orgName: user.organization?.name ?? null,
        },
      });
    } catch {}
    return { error: "Credenziali non valide." };
  }

  try {
    await prisma.superAdminLog.create({
      data: {
        id: `${Date.now()}-lu`,
        action: `LOGIN_${user.role}`,
        detail: `${user.name} (${email})`,
        orgId: user.organization?.id ?? null,
        orgName: user.organization?.name ?? null,
      },
    });
  } catch (e) {
    console.error("[SuperAdminLog] login log error:", e);
  }

  // Set cookies
  const cookieStore = await cookies();
  const cookieOptions = {
    path: "/",
    maxAge: 60 * 60 * 24, // 1 day
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
  };
  cookieStore.set("role", user.role, cookieOptions);
  cookieStore.set("userId", user.id, cookieOptions);
  cookieStore.set("userName", encodeURIComponent(user.name), cookieOptions);
  cookieStore.set("organizationId", user.organization?.id ?? "org_default", cookieOptions);

  // Redirect based on role
  if (user.role === "MANAGER") {
    redirect("/dashboard/manager");
  } else if (user.role === "CLEANER") {
    redirect("/dashboard/cleaner");
  } else if (user.role === "MAINTENANCE") {
    redirect("/dashboard/maintenance");
  } else if (user.role === "SUPERVISOR") {
    redirect("/dashboard/supervisor");
  } else if (user.role === "OWNER") {
    redirect("/dashboard/owner");
  }

  redirect("/dashboard/manager");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.set("role", "", { path: "/", maxAge: 0 });
  cookieStore.set("userId", "", { path: "/", maxAge: 0 });
  cookieStore.set("userName", "", { path: "/", maxAge: 0 });
  cookieStore.set("organizationId", "", { path: "/", maxAge: 0 });
  redirect("/login");
}
