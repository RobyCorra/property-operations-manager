"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/src/lib/prisma";
import bcrypt from "bcryptjs";

type Role = "MANAGER" | "CLEANER" | "MAINTENANCE" | "SUPERVISOR" | "OWNER";

export async function createUser(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as Role;
  const apartmentIds = formData.getAll("apartmentIds") as string[];

  if (!name || !email || !password || !role) {
    return { error: "Tutti i campi sono obbligatori." };
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { error: "L'email è già in uso." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { name, email, password: passwordHash, role },
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

export async function deleteUser(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return;

  await prisma.user.delete({ where: { id } });
  revalidatePath("/dashboard/manager/users");
}
