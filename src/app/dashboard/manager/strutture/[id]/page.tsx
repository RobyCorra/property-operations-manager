import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getStructure } from "@/src/app/actions/structure";
import { getPropertyProducts } from "@/src/app/actions/property-product";
import { getApartmentOperationalStatus, STATUS_UI } from "@/src/lib/apartment-status";
import DeleteStructureButton from "@/src/components/delete-structure-button";
import PropertyProductsPanel from "@/src/components/property-products-panel";
import BackButton from "@/src/components/back-button";

export const dynamic = "force-dynamic";

export default async function StructurePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  if (cookieStore.get("role")?.value !== "MANAGER") redirect("/login");

  const structure = await getStructure(id);
  if (!structure) notFound();

  const products = await getPropertyProducts(id);
  const now = new Date();
  const unitCount = structure.categories.reduce((sum, c) => sum + c.units.length, 0);

  return (
    <main className="min-h-screen bg-[#faf8ff] p-4 md:p-6 font-sans">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <BackButton />
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-blue-500">
                {structure.type === "HOTEL" ? "Hotel" : "Residence"}
              </p>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{structure.name}</h1>
              <p className="mt-1 text-sm text-slate-500">{structure.address} · {unitCount} unità</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {structure.categories.map((c) => (
            <div key={c.id} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{c.name}</p>
                  <p className="text-[12px] text-slate-400">
                    {c.squareMeters} m² · {c.bedrooms} camere · {c.bathrooms} bagni · {c.maxGuests} ospiti · {c.units.length} unità
                  </p>
                </div>
                <Link
                  href={`/dashboard/manager/strutture/${id}/categoria/${c.id}`}
                  className="shrink-0 rounded-full bg-violet-500/10 px-4 py-2 text-xs font-semibold text-violet-600"
                >
                  Modifica master
                </Link>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {c.units.map((u) => {
                  const s = getApartmentOperationalStatus(now, u.bookings, u.cleaningTasks, u.maintenanceTickets, { now });
                  return (
                    <Link
                      key={u.id}
                      href={`/dashboard/manager/apartments/${u.id}/edit`}
                      title={s.label}
                      className={`rounded-lg border px-3 py-1.5 text-[12px] font-bold ${STATUS_UI[s.color].tailwind}`}
                    >
                      {u.unitNumber || "—"}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <PropertyProductsPanel propertyId={structure.id} initialProducts={products} />

        <div className="pt-2">
          <DeleteStructureButton propertyId={structure.id} name={structure.name} />
        </div>
      </div>
    </main>
  );
}
