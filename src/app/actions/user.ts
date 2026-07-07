"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/src/lib/prisma";
import bcrypt from "bcryptjs";
import { getCurrentOrg } from "@/src/lib/tenant";

type Role = "MANAGER" | "CLEANER" | "MAINTENANCE" | "SUPERVISOR" | "OWNER" | "CHECKIN";

export async function createUser(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  const email = ((formData.get("email") as string) || "").trim().toLowerCase();
  const password = formData.get("password") as string;
  const role = formData.get("role") as Role;
  const apartmentIds = formData.getAll("apartmentIds") as string[];
  const phone = (formData.get("phone") as string)?.trim() || null;
  const address = (formData.get("address") as string)?.trim() || null;
  const isExternal = formData.get("isExternal") === "true";
  const companyName = isExternal ? (formData.get("companyName") as string)?.trim() || null : null;
  const vatNumber = isExternal ? (formData.get("vatNumber") as string)?.trim() || null : null;
  const iban = isExternal ? (formData.get("iban") as string)?.trim() || null : null;

  if (!name || !email || !password || !role) {
    return { error: "Tutti i campi sono obbligatori." };
  }

  const existingUser = await prisma.user.findFirst({ where: { email: { equals: email, mode: "insensitive" } } });
  if (existingUser) {
    return { error: "L'email è già in uso." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const orgId = await getCurrentOrg();

  const user = await prisma.user.create({
    data: { name, email, password: passwordHash, role, organizationId: orgId, phone, address, isExternal, companyName, vatNumber, iban },
  });

  if (role === "SUPERVISOR" && apartmentIds.length > 0) {
    await prisma.apartmentSupervisor.createMany({
      data: apartmentIds.map(apartmentId => ({ apartmentId, userId: user.id })),
      skipDuplicates: true,
    });
  }

  if (role === "OWNER" && apartmentIds.length > 0) {
    await prisma.apartmentOwner.createMany({
      data: apartmentIds.map(apartmentId => ({ apartmentId, userId: user.id })),
      skipDuplicates: true,
    });
  }

  revalidatePath("/dashboard/manager/users");
  redirect("/dashboard/manager/users");
}

export async function updateUser(prevState: any, formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const email = ((formData.get("email") as string) || "").trim().toLowerCase();
  const password = formData.get("password") as string;
  const role = formData.get("role") as Role;
  const apartmentIds = formData.getAll("apartmentIds") as string[];
  const phone = (formData.get("phone") as string)?.trim() || null;
  const address = (formData.get("address") as string)?.trim() || null;
  const isExternal = formData.get("isExternal") === "true";
  const companyName = isExternal ? (formData.get("companyName") as string)?.trim() || null : null;
  const vatNumber = isExternal ? (formData.get("vatNumber") as string)?.trim() || null : null;
  const iban = isExternal ? (formData.get("iban") as string)?.trim() || null : null;

  if (!id || !name || !email || !role) {
    return { error: "Tutti i campi obbligatori mancanti." };
  }

  const existing = await prisma.user.findFirst({ where: { email: { equals: email, mode: "insensitive" } } });
  if (existing && existing.id !== id) {
    return { error: "L'email è già in uso da un altro utente." };
  }

  const data: any = { name, email, role, phone, address, isExternal, companyName, vatNumber, iban };
  if (password && password.length >= 8) {
    data.password = await bcrypt.hash(password, 10);
  } else if (password && password.length > 0) {
    return { error: "La password deve essere di almeno 8 caratteri." };
  }

  // Use a transaction to keep user + apartment assignments atomic
  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id }, data });

    if (role === "SUPERVISOR") {
      await tx.apartmentSupervisor.deleteMany({ where: { userId: id } });
      if (apartmentIds.length > 0) {
        await tx.apartmentSupervisor.createMany({
          data: apartmentIds.map(apartmentId => ({ apartmentId, userId: id })),
          skipDuplicates: true,
        });
      }
    } else if (role === "OWNER") {
      await tx.apartmentOwner.deleteMany({ where: { userId: id } });
      if (apartmentIds.length > 0) {
        await tx.apartmentOwner.createMany({
          data: apartmentIds.map(apartmentId => ({ apartmentId, userId: id })),
          skipDuplicates: true,
        });
      }
    } else {
      // If role changed away from SUPERVISOR/OWNER, clean up old assignments
      await tx.apartmentSupervisor.deleteMany({ where: { userId: id } });
      await tx.apartmentOwner.deleteMany({ where: { userId: id } });
    }
  });

  revalidatePath("/dashboard/manager/users");
  redirect(`/dashboard/manager/users`);
}

export async function deleteUser(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;

  await prisma.user.delete({ where: { id } });
  revalidatePath("/dashboard/manager/users");
}
