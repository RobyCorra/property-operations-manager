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
  });

  if (!user) {
    return { error: "Credenziali non valide." };
  }

  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    return { error: "Credenziali non valide." };
  }

  // Set cookies
  const cookieStore = await cookies();
  cookieStore.set("role", user.role, { 
    path: "/", 
    maxAge: 60 * 60 * 24, // 1 day
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax"
  });
  cookieStore.set("userId", user.id, { 
    path: "/", 
    maxAge: 60 * 60 * 24,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax"
  });

  // Redirect based on role
  if (user.role === "MANAGER") {
    redirect("/dashboard/manager");
  } else if (user.role === "CLEANER") {
    // Placeholder redirect for now
    redirect("/dashboard/cleaner");
  } else if (user.role === "MAINTENANCE") {
    // Placeholder redirect for now
    redirect("/dashboard/maintenance");
  }

  redirect("/dashboard/manager");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.set("role", "", { path: "/", maxAge: 0 });
  cookieStore.set("userId", "", { path: "/", maxAge: 0 });
  redirect("/login");
}
