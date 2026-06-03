"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/src/lib/prisma";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export async function registerAction(prevState: any, formData: FormData) {
  const orgName = (formData.get("orgName") as string)?.trim();
  const managerName = (formData.get("managerName") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  // Validation
  if (!orgName || !managerName || !email || !password || !confirmPassword) {
    return { error: "Tutti i campi sono obbligatori." };
  }

  if (password.length < 8) {
    return { error: "La password deve essere di almeno 8 caratteri." };
  }

  if (password !== confirmPassword) {
    return { error: "Le password non coincidono." };
  }

  // Check if email already in use
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Questa email è già registrata." };
  }

  // Generate a unique slug for the organization
  const baseSlug = generateSlug(orgName);
  const randomSuffix = Math.random().toString(36).slice(2, 7);
  const slug = `${baseSlug}-${randomSuffix}`;

  const hashedPassword = await bcrypt.hash(password, 12);

  // Create Organization + Manager user in a transaction
  const { user, org } = await prisma.$transaction(async (tx) => {
    const org = await tx.organization.create({
      data: {
        name: orgName,
        slug,
      },
    });

    const user = await tx.user.create({
      data: {
        name: managerName,
        email,
        password: hashedPassword,
        role: "MANAGER",
        organizationId: org.id,
      },
    });

    return { user, org };
  });

  // Set session cookies
  const cookieStore = await cookies();
  const cookieOptions = {
    path: "/",
    maxAge: 60 * 60 * 24,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
  };

  cookieStore.set("role", user.role, cookieOptions);
  cookieStore.set("userId", user.id, cookieOptions);
  cookieStore.set("userName", user.name, cookieOptions);
  cookieStore.set("organizationId", org.id, cookieOptions);

  redirect("/dashboard/manager");
}
