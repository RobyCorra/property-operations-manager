"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/src/lib/prisma";
import { getCurrentUserId } from "@/src/lib/tenant";
import { revalidatePath } from "next/cache";

export type NotificationPrefs = {
  cleaningStarted: boolean;
  cleaningCompleted: boolean;
  maintenanceNew: boolean;
};

const DEFAULT_PREFS: NotificationPrefs = {
  cleaningStarted: true,
  cleaningCompleted: true,
  maintenanceNew: true,
};

export async function getSettingsData() {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Non autenticato");
  const user = { id: userId };
  const full = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      email: true,
      notificationPrefs: true,
      organization: { select: { id: true, name: true } },
    },
  });
  if (!full) throw new Error("Utente non trovato");
  return {
    ...full,
    notificationPrefs: {
      ...DEFAULT_PREFS,
      ...((full.notificationPrefs as Partial<NotificationPrefs>) ?? {}),
    } as NotificationPrefs,
  };
}

export async function updateProfile(formData: FormData) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Non autenticato");
  const user = { id: userId };
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();

  if (!name || !email) return { error: "Nome ed email sono obbligatori." };

  const conflict = await prisma.user.findFirst({ where: { email, NOT: { id: user.id } } });
  if (conflict) return { error: "Email già in uso da un altro utente." };

  await prisma.user.update({ where: { id: user.id }, data: { name, email } });
  revalidatePath("/dashboard/manager");
  return { success: true };
}

export async function updatePassword(formData: FormData) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Non autenticato");
  const user = { id: userId };
  const current = formData.get("current") as string;
  const next = formData.get("next") as string;
  const confirm = formData.get("confirm") as string;

  if (!current || !next || !confirm) return { error: "Tutti i campi sono obbligatori." };
  if (next.length < 8) return { error: "La nuova password deve essere di almeno 8 caratteri." };
  if (next !== confirm) return { error: "Le password non coincidono." };

  const dbUser = await prisma.user.findUnique({ where: { id: user.id }, select: { password: true } });
  if (!dbUser) return { error: "Utente non trovato." };

  const ok = await bcrypt.compare(current, dbUser.password);
  if (!ok) return { error: "Password attuale non corretta." };

  const hashed = await bcrypt.hash(next, 12);
  await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
  return { success: true };
}

export async function updateOrgName(formData: FormData) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Non autenticato");
  const user = { id: userId };
  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "Il nome non può essere vuoto." };

  const full = await prisma.user.findUnique({
    where: { id: user.id },
    select: { organizationId: true },
  });
  if (!full?.organizationId) return { error: "Organizzazione non trovata." };

  await prisma.organization.update({ where: { id: full.organizationId }, data: { name } });
  revalidatePath("/dashboard/manager");
  return { success: true };
}

export async function updateNotificationPrefs(prefs: NotificationPrefs) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Non autenticato");
  const user = { id: userId };
  await prisma.user.update({
    where: { id: user.id },
    data: { notificationPrefs: prefs },
  });
  return { success: true };
}
