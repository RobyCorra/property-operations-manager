import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { getCompanyAccess } from "@/src/lib/company-access";

import { getApartmentOperationalStatus } from "@/src/lib/apartment-status";
import TimelineCalendar from "@/src/components/timeline-calendar";
import DashboardKpiCards, { type KpiPopupItem } from "@/src/components/dashboard-kpi-cards";
import ImpresaMobileDashboard from "@/src/components/impresa-mobile-dashboard";
import ImpresaMaintenanceCalendarWrapper from "@/src/components/impresa-maintenance-calendar-wrapper";
import ImpresaMaintenanceKpi, { type MaintKpiItem } from "@/src/components/impresa-maintenance-kpi";

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

  const { scopes, orgIds, scopeApartments } = access;
  const now = new Date();
  const serverDate = now.toISOString();
  const hasCleaning = scopes.includes("CLEANING") && orgIds.length > 0;
  const hasMaintenance = scopes.includes("MAINTENANCE") && orgIds.length > 0;

  // Filtro appartamenti: se la delega specifica degli appartamenti, usa quelli
  const cleaningAptFilter = scopeApartments?.CLEANING;
  const aptWhere = cleaningAptFilter
    ? { id: { in: cleaningAptFilter }, organizationId: { in: orgIds } }
    : { organizationId: { in: orgIds } };
  const cleaningTaskWhere = cleaningAptFilter
    ? { apartmentId: { in: cleaningAptFilter }, status: { not: "CANCELLED" as const } }
    : { apartment: { organizationId: { in: orgIds } }, status: { not: "CANCELLED" as const } };

  const apts = hasCleaning
    ? await prisma.apartment.findMany({
        where: aptWhere,
        select: {
          id: true, name: true, address: true, bathrooms: true, bedConfig: true,
          propertyId: true, unitCategoryId: true, unitNumber: true,
          property: { select: { name: true } },
          unitCategory: { select: { name: true } },
        },
      })
    : [];

  const aptIds = apts.map((a) => a.id);

  const cleanings = hasCleaning
    ? await prisma.cleaningTask.findMany({
        where: cleaningAptFilter
          ? { apartmentId: { in: cleaningAptFilter }, status: { not: "CANCELLED" } }
          : { apartment: { organizationId: { in: orgIds } }, status: { not: "CANCELLED" } },
        select: {
          id: true, apartmentId: true, date: true, status: true, notes: true,
          checklistProgress: true, cullaRequested: true, sofaBedForced: true, totalGuests: true,
          assignedToId: true,
          assignedTo: { select: { id: true, name: true } },
          apartment: { select: { name: true, address: true, organizationId: true } },
        },
        orderBy: { date: "asc" },
      })
    : [];

  // Prenotazioni: solo per CONTESTO nel calendario (sola lettura, nessun importo).
  const bookingsRaw = hasCleaning
    ? await prisma.booking.findMany({
        where: cleaningAptFilter
          ? { apartmentId: { in: cleaningAptFilter }, status: { not: "CANCELLED" } }
          : { apartment: { organizationId: { in: orgIds } }, status: { not: "CANCELLED" } },
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

  // Etichetta cliente (proprietario) per i popup KPI.
  const orgs = orgIds.length
    ? await prisma.organization.findMany({ where: { id: { in: orgIds } }, select: { id: true, name: true } })
    : [];
  const orgName = new Map(orgs.map((o) => [o.id, o.name]));

  const todayKey = localDateKey(now);
  const fmtTime = (d: Date | string) => new Date(d).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
  const toItem = (c: (typeof cleanings)[number]): KpiPopupItem => ({
    id: c.id,
    label: c.apartment.name,
    sublabel: `${fmtTime(c.date)} · ${orgName.get(c.apartment.organizationId ?? "") ?? ""}`,
    href: `/dashboard/impresa/pulizie/${c.id}`,
  });

  const todayCleanings = cleanings.filter((c) => localDateKey(c.date) === todayKey);
  const cleaningsTodayKpi = todayCleanings.map(toItem);
  const lateCleaningsKpi = cleanings
    .filter((c) => c.status === "PENDING" && now.getTime() > new Date(c.date).getTime() + 30 * 60 * 1000)
    .map(toItem);
  const inProgressKpi = cleanings.filter((c) => c.status === "IN_PROGRESS").map(toItem);
  const cleaningsDoneCount = todayCleanings.filter((c) => c.status === "APPROVED").length;

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

  const lateCleanings = cleanings
    .filter((c) => c.status === "PENDING" && now.getTime() > new Date(c.date).getTime() + 30 * 60 * 1000)
    .map((c) => ({
      id: c.id,
      apartmentName: c.apartment.name,
      assignedToName: c.assignedTo?.name ?? "—",
      scheduledTime: fmtTime(c.date),
    }));

  const cleaningsInProgress = cleanings
    .filter((c) => c.status === "IN_PROGRESS")
    .map((c) => ({
      id: c.id,
      apartmentName: c.apartment.name,
      assignedToName: c.assignedTo?.name ?? "—",
    }));

  const cleaningsTodayItems = todayCleanings.map((c) => ({
    id: c.id,
    apartmentName: c.apartment.name,
    assignedToName: c.assignedTo?.name ?? "—",
    isAssigned: !!c.assignedToId,
    status: c.status,
  }));

  const todayBookingsCount = bookings.filter((b) => localDateKey(b.checkInDate) === todayKey).length;

  // ── Manutenzione: calendario per appartamento (solo ticket) ──
  const maintAptFilter = scopeApartments?.MAINTENANCE;
  const maintApts = hasMaintenance
    ? await prisma.apartment.findMany({
        where: maintAptFilter
          ? { id: { in: maintAptFilter }, organizationId: { in: orgIds } }
          : { organizationId: { in: orgIds } },
        select: {
          id: true, name: true, address: true, bathrooms: true, bedConfig: true,
          propertyId: true, unitCategoryId: true, unitNumber: true,
          property: { select: { name: true } },
          unitCategory: { select: { name: true } },
        },
      })
    : [];

  const maintTickets = hasMaintenance
    ? await prisma.maintenanceTicket.findMany({
        where: maintAptFilter
          ? { apartmentId: { in: maintAptFilter }, status: { notIn: ["CANCELLED", "PROPOSED", "REJECTED"] } }
          : { apartment: { organizationId: { in: orgIds } }, status: { notIn: ["CANCELLED", "PROPOSED", "REJECTED"] } },
        select: {
          id: true, apartmentId: true, title: true, description: true, status: true, priority: true,
          createdAt: true, scheduledStart: true, scheduledEnd: true, maintenanceTasks: true,
          assignedTo: { select: { id: true, name: true } },
          apartment: { select: { name: true, address: true } },
          attachments: { select: { id: true, url: true, fileName: true, fileType: true } },
        },
        orderBy: { createdAt: "desc" },
      })
    : [];


  // Prenotazioni e pulizie degli appartamenti manutenzione (contesto calendario "Tutto")
  const maintAptIds = maintApts.map((a) => a.id);
  const maintBookingsRaw = hasMaintenance && maintAptIds.length > 0
    ? await prisma.booking.findMany({
        where: { apartmentId: { in: maintAptIds }, status: { not: "CANCELLED" } },
        select: {
          id: true, apartmentId: true, guestName: true, checkInDate: true, checkOutDate: true,
          totalGuests: true, cullaRequested: true, status: true, source: true, externalId: true,
          apartment: { select: { name: true, address: true } },
        },
      })
    : [];
  const maintBookings = maintBookingsRaw.map((b) => ({
    ...b,
    guestName: b.guestName ?? "",
    status: b.status ?? undefined,
    source: b.source ?? undefined,
    externalId: b.externalId ?? undefined,
  }));
  const maintCleanings = hasMaintenance && maintAptIds.length > 0
    ? await prisma.cleaningTask.findMany({
        where: { apartmentId: { in: maintAptIds }, status: { not: "CANCELLED" } },
        select: {
          id: true, apartmentId: true, date: true, status: true, notes: true,
          checklistProgress: true, cullaRequested: true, sofaBedForced: true, totalGuests: true,
          assignedToId: true,
          assignedTo: { select: { id: true, name: true } },
          apartment: { select: { name: true, address: true, organizationId: true } },
        },
        orderBy: { date: "asc" },
      })
    : [];

  const maintApartmentsData = maintApts.map((a) => {
    const aptTickets = maintTickets.filter((t) => t.apartmentId === a.id);
    const s = getApartmentOperationalStatus(serverDate, [], [], aptTickets as never, { now });
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

  // ── KPI manutenzione impresa ──
  const maintTodayKey = localDateKey(now);
  const DONE_STATUSES = ["RESOLVED", "COMPLETED", "APPROVED", "CLOSED"];
  const fmtTimeMaint = (d: Date | string) => new Date(d).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
  const toMaintItem = (t: (typeof maintTickets)[number]): MaintKpiItem => ({
    id: t.id,
    label: t.title,
    sublabel: `${t.apartment.name} · ${t.scheduledStart ? fmtTimeMaint(t.scheduledStart) : "—"}`,
    href: `/dashboard/impresa/manutenzione/${t.id}`,
  });

  const maintTicketsToday = maintTickets.filter((t) => t.scheduledStart && localDateKey(t.scheduledStart) === maintTodayKey);
  const maintKpiToday = maintTicketsToday.map(toMaintItem);
  const maintKpiOpen = maintTickets.filter((t) => t.status === "IN_PROGRESS").map(toMaintItem);
  const maintKpiLate = maintTicketsToday.filter((t) => {
    if (DONE_STATUSES.includes(t.status) || t.status === "IN_PROGRESS") return false;
    if (!t.scheduledStart) return false;
    return now.getTime() > new Date(t.scheduledStart).getTime() + 30 * 60 * 1000;
  }).map(toMaintItem);
  const maintKpiClosed = maintTicketsToday.filter((t) => DONE_STATUSES.includes(t.status)).map(toMaintItem);
  const maintKpiUnassigned = maintTickets.filter((t) => !t.assignedTo && !DONE_STATUSES.includes(t.status) && t.status !== "CANCELLED" && t.status !== "PROPOSED" && t.status !== "REJECTED").map(toMaintItem);

  const mobileApts = apartmentsData.map((a) => ({
    id: a.id,
    name: a.name,
    status: a.status,
    propertyId: a.propertyId,
    propertyName: a.propertyName,
    unitCategoryId: a.unitCategoryId,
    categoryName: a.categoryName,
    unitNumber: a.unitNumber,
  }));

  return (
    <>
      {/* ── MOBILE ── */}
      <div className="block md:hidden -m-4">
        {hasCleaning ? (
          <ImpresaMobileDashboard
            apartments={mobileApts}
            lateCleanings={lateCleanings}
            cleaningsInProgress={cleaningsInProgress}
            cleaningsCount={todayCleanings.length}
            cleaningsDoneCount={cleaningsDoneCount}
            cleaningsTodayItems={cleaningsTodayItems}
            checkinsCount={todayBookingsCount}
            serverDate={serverDate}
          />
        ) : hasMaintenance ? (
          <div className="px-4 pt-4 space-y-4">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-slate-900">Manutenzione</h1>
              <p className="mt-1 text-sm text-slate-500">Calendario interventi per appartamento.</p>
            </div>
            <ImpresaMaintenanceKpi
              ticketsToday={maintKpiToday}
              ticketsOpen={maintKpiOpen}
              ticketsLate={maintKpiLate}
              ticketsClosed={maintKpiClosed}
              ticketsUnassigned={maintKpiUnassigned}
            />
            <section className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
              <ImpresaMaintenanceCalendarWrapper
                apartments={maintApartmentsData}
                maintenanceTickets={maintTickets as never}
                bookings={maintBookings}
                cleaningTasks={maintCleanings}
                maintenanceDetailBase="/dashboard/impresa/manutenzione"
                serverDate={serverDate}
              />
            </section>
          </div>
        ) : (
          <div className="px-4 pt-4">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
              Nessuna funzione operativa attiva. Attendi che un proprietario ti deleghi un servizio.
            </div>
          </div>
        )}
      </div>

      {/* ── DESKTOP ── */}
      <div className="hidden md:block max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Panoramica</h1>
          <p className="mt-1 text-sm text-slate-500">
            {scopes.length ? scopes.map((s) => SCOPE_META[s]?.label ?? s).join(" · ") : "nessuna funzione delegata"}
            {orgIds.length > 0 && ` · ${orgIds.length} client${orgIds.length === 1 ? "e" : "i"}`}
          </p>
        </div>

        {hasCleaning && (
          <>
            <DashboardKpiCards
              checkinsToday={[]}
              cleaningsToday={cleaningsTodayKpi}
              lateCleanings={lateCleaningsKpi}
              cleaningsInProgress={inProgressKpi}
              urgentTickets={[]}
              cleaningsDoneCount={cleaningsDoneCount}
              ticketsTodayCount={0}
              ticketsDoneCount={0}
            />

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
        )}

        {hasMaintenance && (
          <>
          <ImpresaMaintenanceKpi
            ticketsToday={maintKpiToday}
            ticketsOpen={maintKpiOpen}
            ticketsLate={maintKpiLate}
            ticketsClosed={maintKpiClosed}
            ticketsUnassigned={maintKpiUnassigned}
          />
          <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <ImpresaMaintenanceCalendarWrapper
              apartments={maintApartmentsData}
              maintenanceTickets={maintTickets as never}
              bookings={maintBookings}
              cleaningTasks={maintCleanings}
              maintenanceDetailBase="/dashboard/impresa/manutenzione"
              serverDate={serverDate}
            />
          </section>
          </>
        )}

        {!hasCleaning && !hasMaintenance && (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
            Nessuna funzione operativa attiva. Attendi che un proprietario ti deleghi un servizio.
          </div>
        )}

        {(scopes.includes("CHECKIN") || scopes.includes("SUPERVISION")) && (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white/50 p-5 text-center text-xs text-gray-400">
            {scopes.filter((s) => s === "CHECKIN" || s === "SUPERVISION").map((s) => SCOPE_META[s]?.label).join(" · ")}: vista in arrivo.
          </div>
        )}
      </div>
    </>
  );
}
