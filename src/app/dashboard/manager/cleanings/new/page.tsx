import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/src/lib/prisma";
import { createCleaningTask } from "@/src/app/actions/operational";
import OperationalForm from "@/src/components/operational-form";
import BackButton from "@/src/components/back-button";

export default async function NewCleaningPage() {
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;

  if (role !== "MANAGER") {
    redirect("/login");
  }

  const [apartments, cleaners] = await Promise.all([
    prisma.apartment.findMany({ select: { id: true, name: true } }),
    prisma.user.findMany({ where: { role: "CLEANER" }, select: { id: true, name: true } }),
  ]);

  return (
    <main className="min-h-screen bg-gray-50/50 p-6 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <BackButton />
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900 mt-3">Programma Pulizia</h1>
          <p className="text-gray-500 mt-1">Assegna un intervento di pulizia a un addetto</p>
        </div>

        <OperationalForm 
          type="CLEANING"
          apartments={apartments}
          personnel={cleaners}
          action={createCleaningTask}
        />
      </div>
    </main>
  );
}
