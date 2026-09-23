import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { getCompanyAccess } from "@/src/lib/company-access";
import { getApartmentOperationalStatus } from "@/src/lib/apartment-status";
import TimelineCalendar from "@/src/components/timeline-calendar";
import ImpresaApartmentCalendar from "@/src/components/impresa-apartment-calendar";
import type { CalBooking, CalCleaning, CalTicket } from "@/src/components/impresa-apartment-calendar";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ImpresaAppartamentoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = await cookies();
  if (c.get("role")?.value !== "MANAGER" || !c.get("companyId")?.value) redirect("/login");
  const access = await getCompanyAccess();
  if (!access) redirect("/login");

  const apt = await prisma.apartment.findUnique({
    where: { id },
    select: {
      id: true, name: true, address: true, organizationId: true, bathrooms: true, bedConfig: true,
      propertyId: true, unitCategoryId: true, unitNumber: true,
      property: { select: { name: true } },
      unitCategory: { select: { name: true } },
    },
  });
  if (!apt || !access.orgIds.includes(apt.organizationId ?? "")) redirect("/dashboard/impresa");
  // Se la delega specifica appartamenti, verifica che questo sia incluso
  const allScopeApts = Object.values(access.scopeApartments ?? {});
  const hasAptFilter = allScopeApts.some((v) => v !== null);
  if (hasAptFilter) {
    const allowedApts = new Set(allScopeApts.filter((v): v is string[] => v !== null).flat());
    if (!allowedApts.has(id)) redirect("/dashboard/impresa");
  }

  const serverDate = new Date().toISOString();
  const now = new Date();

  const [cleanings, bookingsRaw, tickets] = await Promise.all([
    prisma.cleaningTask.findMany({
      where: { apartmentId: id, status: { not: "CANCELLED" } },
      select: {
        id: true, apartmentId: true, date: true, status: true, notes: true,
        checklistProgress: true, cullaRequested: true, sofaBedForced: true, totalGuests: true,
        assignedToId: true,
        assignedTo: { select: { id: true, name: true } },
        apartment: { select: { name: true, address: true, organizationId: true } },
      },
      orderBy: { date: "asc" },
    }),
    prisma.booking.findMany({
      where: { apartmentId: id, status: { not: "CANCELLED" } },
      select: {
        id: true, apartmentId: true, guestName: true, checkInDate: true, checkOutDate: true,
        totalGuests: true, cullaRequested: true, status: true, source: true, externalId: true,
        apartment: { select: { name: true, address: true } },
      },
    }),
    prisma.maintenanceTicket.findMany({
      where: { apartmentId: id, status: { not: "CANCELLED" } },
      select: {
        id: true, apartmentId: true, title: true, status: true, priority: true,
        createdAt: true, scheduledStart: true, scheduledEnd: true,
        assignedTo: { select: { id: true, name: true } },
        apartment: { select: { name: true, address: true } },
      },
    }),
  ]);

  const bookings = bookingsRaw.map((b) => ({
    ...b,
    guestName: b.guestName ?? "",
    status: b.status ?? undefined,
    source: b.source ?? undefined,
    externalId: b.externalId ?? undefined,
  }));

  const opStatus = getApartmentOperationalStatus(serverDate, bookings, cleanings, tickets, { now });

  const statusColors: Record<string, string> = {
    GREEN: "text-emerald-600", RED: "text-red-600", BLUE: "text-blue-600",
    VIOLET: "text-violet-600", YELLOW: "text-yellow-600",
  };
  const statusLabels: Record<string, string> = {
    GREEN: "Pronto", RED: "Occupato", BLUE: "Non pronto",
    VIOLET: "In corso", YELLOW: "In revisione",
  };
  const dotColors: Record<string, string> = {
    GREEN: "bg-emerald-500", RED: "bg-red-500", BLUE: "bg-blue-500",
    VIOLET: "bg-violet-500", YELLOW: "bg-yellow-400",
  };

  const aptData = [{
    id: apt.id,
    name: apt.name,
    address: apt.address ?? "",
    status: opStatus.color,
    bathrooms: apt.bathrooms,
    bedConfig: apt.bedConfig,
    propertyId: apt.propertyId,
    propertyName: apt.property?.name ?? null,
    unitCategoryId: apt.unitCategoryId,
    categoryName: apt.unitCategory?.name ?? null,
    unitNumber: apt.unitNumber,
  }];

  const openTickets = tickets.filter((t) => t.status === "OPEN" || t.status === "IN_PROGRESS").length;

  // Serialize data for the mobile calendar client component
  const calBookings: CalBooking[] = bookings.map((b) => ({
    id: b.id,
    guestName: b.guestName || null,
    checkInDate: new Date(b.checkInDate).toISOString(),
    checkOutDate: new Date(b.checkOutDate).toISOString(),
    totalGuests: b.totalGuests ?? null,
    status: b.status ?? null,
  }));
  const calCleanings: CalCleaning[] = cleanings.map((cl) => ({
    id: cl.id,
    date: new Date(cl.date).toISOString(),
    status: cl.status,
    assignedTo: cl.assignedTo ? { name: cl.assignedTo.name } : null,
  }));
  const calTickets: CalTicket[] = tickets.map((t) => ({
    id: t.id,
    title: t.title,
    status: t.status,
    priority: t.priority ?? null,
    createdAt: new Date(t.createdAt).toISOString(),
    scheduledStart: t.scheduledStart ? new Date(t.scheduledStart).toISOString() : null,
    assignedTo: t.assignedTo ? { name: t.assignedTo.name } : null,
  }));

  return (
    <>
      {/* ── MOBILE: inline calendar matching MobileDashboard ── */}
      <div className="block md:hidden -m-4 h-screen overflow-hidden">
        <ImpresaApartmentCalendar
          aptId={apt.id}
          aptName={apt.name}
          aptStatus={opStatus.color}
          openTickets={openTickets}
          bookings={calBookings}
          cleanings={calCleanings}
          tickets={calTickets}
        />
      </div>

      {/* ── DESKTOP: existing TimelineCalendar ── */}
      <div className="hidden md:block max-w-2xl mx-auto space-y-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/impresa"
            className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </Link>
          <span className={`w-3 h-3 rounded-full shrink-0 ${dotColors[opStatus.color] ?? "bg-slate-400"}`} />
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-slate-900 truncate">{apt.name}</h1>
            <p className="text-sm">
              <span className={statusColors[opStatus.color] ?? "text-slate-500"}>
                {statusLabels[opStatus.color] ?? "—"}
              </span>
              {openTickets > 0 && (
                <span className="text-red-500 ml-2 font-semibold">· {openTickets} ticket aperti</span>
              )}
            </p>
          </div>
        </div>

        <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <span>🗓️</span> Calendario
          </h2>
          <TimelineCalendar
            apartments={aptData}
            bookings={bookings}
            cleaningTasks={cleanings}
            maintenanceTickets={tickets}
            serverDate={serverDate}
            readOnly
          />
        </section>

        {cleanings.filter((cl) => cl.status === "PENDING" || cl.status === "IN_PROGRESS").length > 0 && (
          <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">Prossime pulizie</h2>
            <div className="space-y-2">
              {cleanings
                .filter((cl) => cl.status === "PENDING" || cl.status === "IN_PROGRESS")
                .slice(0, 5)
                .map((cl) => (
                  <Link
                    key={cl.id}
                    href={`/dashboard/impresa/pulizie/${cl.id}`}
                    className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5 text-sm hover:bg-slate-100"
                  >
                    <span className={`w-2 h-2 rounded-full shrink-0 ${cl.status === "IN_PROGRESS" ? "bg-violet-500" : "bg-amber-400"}`} />
                    <span className="flex-1 truncate text-slate-700">
                      {new Date(cl.date).toLocaleDateString("it-IT", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {cl.assignedTo?.name ?? "Non assegnata"}
                    </span>
                    <span className="text-slate-300">›</span>
                  </Link>
                ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
