import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/src/lib/prisma";
import { createMaintenanceTicket } from "@/src/app/actions/operational";
import OperationalForm from "@/src/components/operational-form";
import BackButton from "@/src/components/back-button";

export default async function NewMaintenancePage() {
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;

  if (role !== "MANAGER") {
    redirect("/login");
  }

  const [apartments, technicians] = await Promise.all([
    prisma.apartment.findMany({ select: { id: true, name: true } }),
    prisma.user.findMany({ where: { role: "MAINTENANCE" }, select: { id: true, name: true } }),
  ]);

  return (
    <main className="min-h-screen bg-gray-50/50 p-6 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <BackButton />
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900 mt-3">Apri Ticket Manutenzione</h1>
          <p className="text-gray-500 mt-1">Segnala un problema e assegnalo a un manutentore</p>
        </div>

        <OperationalForm 
          type="MAINTENANCE"
          apartments={apartments}
          personnel={technicians}
          action={createMaintenanceTicket}
        />
      </div>
    </main>
  );
}
