import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/src/lib/prisma";
import UserForm from "@/src/components/user-form";
import BackButton from "@/src/components/back-button";

export default async function NewUserPage() {
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;

  if (role !== "MANAGER") {
    redirect("/login");
  }

  const apartments = await prisma.apartment.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <main className="min-h-screen bg-gray-50/50 p-6 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">

        <div>
          <BackButton />
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Aggiungi al Team</h1>
          <p className="text-gray-500 mt-1">Registra un nuovo collaboratore per gestire pulizie o manutenzione</p>
        </div>

        <UserForm apartments={apartments} />

      </div>
    </main>
  );
}
