import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/src/lib/prisma";
import { updateApartment } from "@/src/app/actions/apartment";
import ApartmentForm from "@/src/components/apartment-form";
import ApartmentAttachmentsPanel, { type ApartmentItem } from "@/src/components/apartment-attachments-panel";
import BackButton from "@/src/components/back-button";

interface EditApartmentPageProps {
  params: Promise<{ id: string }>;
}

function extractItems(profile: unknown): ApartmentItem[] {
  if (!profile || typeof profile !== "object") return [];
  const p = profile as Record<string, unknown>;
  const items: ApartmentItem[] = [];
  const sections: { key: string; label: string }[] = [
    { key: "systems", label: "Impianto" },
    { key: "appliances", label: "Elettrodomestico" },
    { key: "smartHome", label: "Domotica" },
  ];
  for (const { key, label } of sections) {
    const section = p[key];
    if (Array.isArray(section)) {
      for (const item of section) {
        if (item && typeof item === "object" && "name" in item && typeof item.name === "string" && item.name.trim()) {
          items.push({ label, name: item.name.trim() });
        }
      }
    }
  }
  return items;
}

export default async function EditApartmentPage({ params }: EditApartmentPageProps) {
  const { id } = await params;
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;

  if (role !== "MANAGER") {
    redirect("/login");
  }

  const apartment = await prisma.apartment.findUnique({
    where: { id },
    include: {
      apartmentAttachments: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!apartment) {
    notFound();
  }

  const items = extractItems(apartment.technicalProfile);
  const accessMedia = apartment.apartmentAttachments.filter((a) => a.category === "ACCESS");
  const generalAttachments = apartment.apartmentAttachments.filter((a) => a.category !== "ACCESS");

  return (
    <main className="min-h-screen bg-gray-50/50 p-6 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <BackButton />
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Modifica Appartamento</h1>
            <p className="text-gray-500 mt-1">Aggiorna i dettagli della proprietà: {apartment.name}</p>
          </div>
        </div>

        {/* Allegati */}
        <ApartmentAttachmentsPanel
          apartmentId={apartment.id}
          initialAttachments={generalAttachments}
          items={items}
        />

        {/* Form (include tab Accesso) */}
        <ApartmentForm
          initialData={apartment}
          action={updateApartment}
          title="Modifica Appartamento"
          initialAccessMedia={accessMedia}
        />

      </div>
    </main>
  );
}
