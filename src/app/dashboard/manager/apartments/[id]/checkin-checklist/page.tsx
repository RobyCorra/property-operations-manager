import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import CheckinChecklistManager from "@/src/components/checkin-checklist-manager";
import CheckinDefaultTime from "@/src/components/checkin-default-time";
import BackButton from "@/src/components/back-button";
import { prisma } from "@/src/lib/prisma";

export default async function ApartmentCheckinChecklistPage({ params }: { params: { id: string } }) {
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;

  if (role !== "MANAGER") {
    redirect("/login");
  }

  const { id } = await params;

  const apartment = await prisma.apartment.findUnique({
    where: { id },
    include: {
      checkinChecklistItems: { orderBy: { order: "asc" } },
    },
  });

  if (!apartment) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50/50 p-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <div className="flex items-center gap-3">
            <BackButton />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900 mt-2">Checklist Check-in</h1>
          <p className="text-gray-500 mt-1">
            Configura i passaggi del check-in per <span className="font-bold text-gray-900">{apartment.name}</span>
          </p>
        </div>

        <CheckinDefaultTime apartmentId={apartment.id} initialTime={apartment.checkinDefaultTime} />

        <CheckinChecklistManager
          apartmentId={apartment.id}
          initialItems={apartment.checkinChecklistItems.map((item) => ({
            ...item,
            labelTranslations: item.labelTranslations as Record<string, string> | null,
          }))}
        />
      </div>
    </main>
  );
}
