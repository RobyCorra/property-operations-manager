import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { getCompanyAccess } from "@/src/lib/company-access";

export const dynamic = "force-dynamic";

const SCOPE_META: Record<string, { label: string; emoji: string }> = {
  CLEANING: { label: "Pulizie", emoji: "🧹" },
  MAINTENANCE: { label: "Manutenzione", emoji: "🔧" },
  CHECKIN: { label: "Check-in", emoji: "🚪" },
  SUPERVISION: { label: "Supervisione", emoji: "🛡️" },
};

function startOfTodayUTC(): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

const statusPill = (s: string) => {
  const map: Record<string, string> = {
    PENDING: "bg-slate-100 text-slate-600",
    IN_PROGRESS: "bg-violet-100 text-violet-700",
    AWAITING_REVIEW: "bg-amber-100 text-amber-700",
    COMPLETED: "bg-emerald-100 text-emerald-700",
    APPROVED: "bg-emerald-100 text-emerald-700",
  };
  return map[s] ?? "bg-slate-100 text-slate-600";
};

export default async function ImpresaDashboard() {
  const cookieStore = await cookies();
  if (cookieStore.get("role")?.value !== "MANAGER") redirect("/login");
  const access = await getCompanyAccess();
  if (!access) redirect("/dashboard/manager"); // non è un manager d'impresa

  const { scopes, orgIds } = access;

  // Mappa organizationId → nome proprietario (etichetta cliente)
  const orgs = orgIds.length
    ? await prisma.organization.findMany({ where: { id: { in: orgIds } }, select: { id: true, name: true } })
    : [];
  const orgName = new Map(orgs.map((o) => [o.id, o.name]));

  const todayStart = startOfTodayUTC();

  const cleanings =
    scopes.includes("CLEANING") && orgIds.length
      ? await prisma.cleaningTask.findMany({
          where: { apartment: { organizationId: { in: orgIds } }, status: { not: "CANCELLED" }, date: { gte: todayStart } },
          include: { apartment: { select: { name: true, organizationId: true } }, assignedTo: { select: { name: true } } },
          orderBy: { date: "asc" },
          take: 40,
        })
      : [];

  const tickets =
    scopes.includes("MAINTENANCE") && orgIds.length
      ? await prisma.maintenanceTicket.findMany({
          where: { apartment: { organizationId: { in: orgIds } }, status: { in: ["PENDING", "IN_PROGRESS"] } },
          include: { apartment: { select: { name: true, organizationId: true } }, assignedTo: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
          take: 40,
        })
      : [];

  const fmt = (d: Date | string) =>
    new Date(d).toLocaleString("it-IT", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

  return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Panoramica</h1>
          <p className="mt-1 text-sm text-slate-500">
            {scopes.length ? scopes.map((s) => SCOPE_META[s]?.label ?? s).join(" · ") : "nessuna funzione delegata"}
            {orgIds.length > 0 && ` · ${orgIds.length} client${orgIds.length === 1 ? "e" : "i"}`}
          </p>
        </div>

        {scopes.length === 0 && (
          <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
            Nessuna funzione attiva. Attendi che un proprietario ti deleghi una funzione.
          </div>
        )}

        {/* PULIZIE */}
        {scopes.includes("CLEANING") && (
          <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <span>🧹</span> Pulizie <span className="text-gray-400 font-normal">· {cleanings.length}</span>
            </h2>
            {cleanings.length === 0 ? (
              <p className="text-xs text-gray-400">Nessuna pulizia da oggi in poi.</p>
            ) : (
              <div className="space-y-2">
                {cleanings.map((c) => (
                  <div key={c.id} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/70 px-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {c.apartment.name}
                        <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-gray-500">
                          {orgName.get(c.apartment.organizationId ?? "") ?? "—"}
                        </span>
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {fmt(c.date)} · {c.assignedTo?.name ?? "da assegnare"}
                      </p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusPill(c.status)}`}>{c.status}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* MANUTENZIONE */}
        {scopes.includes("MAINTENANCE") && (
          <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <span>🔧</span> Manutenzione <span className="text-gray-400 font-normal">· {tickets.length}</span>
            </h2>
            {tickets.length === 0 ? (
              <p className="text-xs text-gray-400">Nessun ticket aperto.</p>
            ) : (
              <div className="space-y-2">
                {tickets.map((t) => (
                  <div key={t.id} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/70 px-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {t.title}
                        <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-gray-500">
                          {orgName.get(t.apartment.organizationId ?? "") ?? "—"}
                        </span>
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {t.apartment.name} · {t.assignedTo?.name ?? "da assegnare"}
                      </p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusPill(t.status)}`}>{t.status}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* CHECK-IN / SUPERVISIONE: in arrivo */}
        {(scopes.includes("CHECKIN") || scopes.includes("SUPERVISION")) && (
          <section className="rounded-2xl border border-dashed border-gray-200 bg-white/50 p-5 text-center text-xs text-gray-400">
            {scopes.filter((s) => s === "CHECKIN" || s === "SUPERVISION").map((s) => SCOPE_META[s]?.label).join(" · ")}: vista in arrivo.
          </section>
        )}
      </div>
  );
}
