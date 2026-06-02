import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import ChecklistManager from "@/src/components/checklist-manager";
import BackButton from "@/src/components/back-button";
import { prisma } from "@/src/lib/prisma";

export default async function ApartmentChecklistPage({ params }: { params: { id: string } }) {
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;

  if (role !== "MANAGER") {
    redirect("/login");
  }

  const { id } = await params;

  const apartment = await prisma.apartment.findUnique({
    where: { id },
    include: {
      checklistItems: {
        orderBy: { order: "asc" }
      }
    }
  });

  if (!apartment) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50/50 p-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <div className="flex items-center gap-3">
            <BackButton />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900 mt-2">Quality Checklist</h1>
          <p className="text-gray-500 mt-1">Configura gli standard di pulizia per <span className="font-bold text-gray-900">{apartment.name}</span></p>
        </div>

        <ChecklistManager
          apartmentId={apartment.id}
          initialItems={apartment.checklistItems.map((item) => ({
            ...item,
            labelTranslations: item.labelTranslations as Record<string, string> | null,
          }))}
        />

      </div>
    </main>
  );
}
