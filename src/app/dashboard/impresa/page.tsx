import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { getCompanyAccess } from "@/src/lib/company-access";
import { getApartmentOperationalStatus } from "@/src/lib/apartment-status";
import TimelineCalendar from "@/src/components/timeline-calendar";

export const dynamic = "force-dynamic";

const SCOPE_META: Record<string, { label: string; emoji: string }> = {
  CLEANING: { label: "Pulizie", emoji: "🧹" },
  MAINTENANCE: { label: "Manutenzione", emoji: "🔧" },
  CHECKIN: { label: "Check-in", emoji: "🚪" },
  SUPERVISION: { label: "Supervisione", emoji: "🛡️" },
};

function localDateKey(d: Date | string): string {
  const v = new Date(d);
  return `${v.getFullYear()}-${String(v.getMonth() + 1).padStart(2, "0")}-${String(v.getDate()).padStart(2, "0")}`;
}

export default async function ImpresaDashboard() {
  const cookieStore = await cookies();
  if (cookieStore.get("role")?.value !== "MANAGER") redirect("/login");
  const access = await getCompanyAccess();
  if (!access) redirect("/dashboard/manager");

  const { scopes, orgIds } = access;
  const now = new Date();
  const serverDate = now.toISOString();
  const hasCleaning = scopes.includes("CLEANING") && orgIds.length > 0;

  const apts = hasCleaning
    ? await prisma.apartment.findMany({
        where: { organizationId: { in: orgIds } },
        select: {
          id: true, name: true, address: true, bathrooms: true, bedConfig: true,
          propertyId: true, unitCategoryId: true, unitNumber: true,
          property: { select: { name: true } },
          unitCategory: { select: { name: true } },
        },
      })
    : [];

  const cleanings = hasCleaning
    ? await prisma.cleaningTask.findMany({
        where: { apartment: { organizationId: { in: orgIds } }, status: { not: "CANCELLED" } },
        select: {
          id: true, apartmentId: true, date: true, status: true, notes: true,
          checklistProgress: true, cullaRequested: true, sofaBedForced: true, totalGuests: true,
          assignedToId: true,
          assignedTo: { select: { id: true, name: true } },
          apartment: { select: { name: true, address: true } },
        },
        orderBy: { date: "asc" },
      })
    : [];

  // Prenotazioni: solo per CONTESTO nel calendario (sola lettura, nessun importo).
  const bookingsRaw = hasCleaning
    ? await prisma.booking.findMany({
        where: { apartment: { organizationId: { in: orgIds } }, status: { not: "CANCELLED" } },
        select: {
          id: true, apartmentId: true, guestName: true, checkInDate: true, checkOutDate: true,
          totalGuests: true, cullaRequested: true, status: true, source: true, externalId: true,
          apartment: { select: { name: true, address: true } },
        },
      })
    : [];
  const bookings = bookingsRaw.map((b) => ({
    ...b,
    guestName: b.guestName ?? "",
    status: b.status ?? undefined,
    source: b.source ?? undefined,
    externalId: b.externalId ?? undefined,
  }));

  const todayKey = localDateKey(now);
  const kpi = {
    oggi: cleanings.filter((c) => localDateKey(c.date) === todayKey).length,
    daAssegnare: cleanings.filter((c) => !c.assignedToId && (c.status === "PENDING")).length,
    inCorso: cleanings.filter((c) => c.status === "IN_PROGRESS" || c.status === "AWAITING_REVIEW").length,
    approvate: cleanings.filter((c) => c.status === "APPROVED").length,
  };

  const apartmentsData = apts.map((a) => {
    const aptCleanings = cleanings.filter((c) => c.apartmentId === a.id);
    const aptBookings = bookings.filter((b) => b.apartmentId === a.id);
    const s = getApartmentOperationalStatus(serverDate, aptBookings, aptCleanings, [], { now });
    return {
      id: a.id,
      name: a.name,
      address: a.address ?? "",
      status: s.color,
      bathrooms: a.bathrooms,
      bedConfig: a.bedConfig,
      propertyId: a.propertyId,
      propertyName: a.property?.name ?? null,
      unitCategoryId: a.unitCategoryId,
      categoryName: a.unitCategory?.name ?? null,
      unitNumber: a.unitNumber,
    };
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Panoramica</h1>
        <p className="mt-1 text-sm text-slate-500">
          {scopes.length ? scopes.map((s) => SCOPE_META[s]?.label ?? s).join(" · ") : "nessuna funzione delegata"}
          {orgIds.length > 0 && ` · ${orgIds.length} client${orgIds.length === 1 ? "e" : "i"}`}
        </p>
      </div>

      {hasCleaning ? (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { v: kpi.oggi, l: "Pulizie oggi", c: "text-slate-900" },
              { v: kpi.daAssegnare, l: "Da assegnare", c: "text-amber-600" },
              { v: kpi.inCorso, l: "In corso / revisione", c: "text-violet-600" },
              { v: kpi.approvate, l: "Approvate", c: "text-emerald-600" },
            ].map((k, i) => (
              <div key={i} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className={`text-2xl font-semibold ${k.c}`}>{k.v}</div>
                <div className="mt-1 text-[11px] uppercase tracking-wide text-gray-400">{k.l}</div>
              </div>
            ))}
          </div>

          <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <span>🗓️</span> Calendario operativo <span className="font-normal text-gray-400">· pulizie e prenotazioni (sola lettura)</span>
            </h2>
            <TimelineCalendar
              apartments={apartmentsData}
              bookings={bookings}
              cleaningTasks={cleanings}
              maintenanceTickets={[]}
              serverDate={serverDate}
              readOnly
            />
          </section>
        </>
      ) : (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
          Nessuna funzione di pulizia attiva. Attendi che un proprietario ti deleghi le Pulizie.
        </div>
      )}

      {(scopes.includes("MAINTENANCE") || scopes.includes("CHECKIN") || scopes.includes("SUPERVISION")) && (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white/50 p-5 text-center text-xs text-gray-400">
          {scopes.filter((s) => s !== "CLEANING").map((s) => SCOPE_META[s]?.label).join(" · ")}: vista in arrivo.
        </div>
      )}
    </div>
  );
}
