import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/src/lib/prisma";
import { updateApartment } from "@/src/app/actions/apartment";
import ApartmentForm from "@/src/components/apartment-form";
import ApartmentAttachmentsPanel, { type ApartmentItem } from "@/src/components/apartment-attachments-panel";
import BackButton from "@/src/components/back-button"
import { getT } from "@/src/lib/server-lang";

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
  const tr = await getT();
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
      client: { select: { id: true, name: true, type: true } },
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
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900">{tr.aeEditTitle}</h1>
            <p className="text-gray-500 mt-1">{tr.aeEditSub} {apartment.name}</p>
          </div>
        </div>

        {/* Cliente collegato */}
        {apartment.client ? (
          <Link
            href={`/dashboard/manager/clienti?open=${apartment.client.id}`}
            className="flex items-center gap-3 bg-white rounded-2xl border border-slate-200 px-4 py-3 hover:border-violet-300 hover:shadow-sm transition-colors"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black flex-shrink-0 ${apartment.client.type === "COMPANY" ? "bg-gradient-to-br from-violet-600 to-fuchsia-500" : "bg-gradient-to-br from-sky-500 to-cyan-400"}`}>
              {apartment.client.name.split(" ").filter(Boolean).map((p) => p[0]).join("").toUpperCase().slice(0, 2) || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{tr.aptClient}</p>
              <p className="font-bold text-slate-900 text-sm truncate">{apartment.client.name}</p>
            </div>
            <span className="text-violet-400 text-lg">›</span>
          </Link>
        ) : (
          <Link
            href="/dashboard/manager/clienti"
            className="flex items-center gap-3 bg-white rounded-2xl border border-dashed border-slate-200 px-4 py-3 text-slate-400 hover:border-violet-300 hover:text-violet-600 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-lg flex-shrink-0">🧾</div>
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest">{tr.aptClient}</p>
              <p className="text-sm font-semibold">{tr.aptNoClient} — {tr.aptAssignClient}</p>
            </div>
            <span className="text-lg">›</span>
          </Link>
        )}

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
