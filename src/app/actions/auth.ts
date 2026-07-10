"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/src/lib/prisma";

export async function loginAction(prevState: any, formData: FormData) {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email e password richiesti." };
  }

  // Ricerca case-insensitive + trim: evita "Email non trovata" per differenze
  // di maiuscole/minuscole o spazi tra come è stata salvata e come viene digitata.
  const user = await prisma.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
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

  // Blocco temporaneo dopo troppi tentativi falliti
  const MAX_ATTEMPTS = 5;
  const LOCK_MINUTES = 15;
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const mins = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
    return { error: `Account temporaneamente bloccato per troppi tentativi. Riprova tra ${mins} minuti.` };
  }

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    const nextCount = (user.failedLoginCount ?? 0) + 1;
    const shouldLock = nextCount >= MAX_ATTEMPTS;
    try {
      const res = await prisma.user.updateMany({
        where: { id: user.id },
        data: shouldLock
          ? { failedLoginCount: 0, lockedUntil: new Date(Date.now() + LOCK_MINUTES * 60000) }
          : { failedLoginCount: nextCount },
      });
      const after = await prisma.user.findUnique({ where: { id: user.id }, select: { failedLoginCount: true } });
      try {
        await prisma.superAdminLog.create({
          data: {
            id: `${Date.now()}-lockdbg`,
            action: "LOCKOUT_DEBUG",
            detail: `count=${res.count} before=${user.failedLoginCount} target=${nextCount} after=${after?.failedLoginCount}`,
          },
        });
      } catch {}
    } catch (e) {
      try {
        await prisma.superAdminLog.create({
          data: {
            id: `${Date.now()}-lockerr`,
            action: "LOCKOUT_ERROR",
            detail: String((e as any)?.message ?? e).slice(0, 400),
          },
        });
      } catch {}
    }
    try {
      await prisma.superAdminLog.create({
        data: {
          id: `${Date.now()}-lf`,
          action: shouldLock ? "LOGIN_BLOCCATO" : "LOGIN_FALLITO",
          detail: `Password errata: ${user.name} (${email})${shouldLock ? " — account bloccato" : ""}`,
          orgId: user.organization?.id ?? null,
          orgName: user.organization?.name ?? null,
        },
      });
    } catch {}
    return shouldLock
      ? { error: `Troppi tentativi falliti: account bloccato per ${LOCK_MINUTES} minuti.` }
      : { error: "Credenziali non valide." };
  }

  // Login riuscito → azzera i contatori se necessario
  if ((user.failedLoginCount ?? 0) > 0 || user.lockedUntil) {
    try {
      await prisma.user.update({ where: { id: user.id }, data: { failedLoginCount: 0, lockedUntil: null } });
    } catch {}
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
  } else if (user.role === "CHECKIN") {
    redirect("/dashboard/checkin");
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
