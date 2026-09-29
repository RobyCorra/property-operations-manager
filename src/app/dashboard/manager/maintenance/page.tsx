import { cookies } from "next/headers";
import { getT } from "@/src/lib/server-lang";
import { redirect } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { getCurrentOrg } from "@/src/lib/tenant";
import Link from "next/link";
import MaintenanceListTable from "@/src/components/maintenance-list-table";
import BackButton from "@/src/components/back-button";
import DbErrorState from "@/src/components/db-error-state";
import { getPendingDateRequests, getPendingMaintenanceProposals } from "@/src/app/actions/company";
import MaintenanceDateRequestDecision from "@/src/components/maintenance-date-request-decision";
import MaintenanceProposalDecision from "@/src/components/maintenance-proposal-decision";

function fmtReqDate(iso: string) {
  return new Date(iso).toLocaleString("it-IT", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default async function MaintenanceListPage() {
  const tr = await getT();
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;

  if (role !== "MANAGER") {
    redirect("/login");
  }

  const orgId = await getCurrentOrg();

  const data = await Promise.all([
    prisma.maintenanceTicket.findMany({
      where: { apartment: { organizationId: orgId }, status: { notIn: ["PROPOSED", "REJECTED"] } },
      include: {
        apartment: true,
        assignedTo: true,
        attachments: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.apartment.findMany({ where: { organizationId: orgId }, select: { id: true, name: true } }),
    prisma.user.findMany({ where: { role: "MAINTENANCE", organizationId: orgId }, select: { id: true, name: true } })
  ]).catch((e) => {
    console.error("Manutenzioni: impossibile caricare i dati dal DB", e);
    return null;
  });

  if (!data) {
    return <DbErrorState />;
  }

  const [tickets, apartments, collaborators] = data;
  const [dateRequests, proposals] = await Promise.all([
    getPendingDateRequests().catch(() => []),
    getPendingMaintenanceProposals().catch(() => []),
  ]);

  return (
    <main className="min-h-screen bg-[#faf8ff] p-4 md:p-6 font-sans overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="sticky top-0 z-30 -mx-4 md:-mx-6 px-4 md:px-6 pb-3 -mt-4 md:-mt-6 bg-[#faf8ff] flex items-center gap-4" style={{ paddingTop: "calc(env(safe-area-inset-top) + 16px)" }}>
          <BackButton />
          <div className="flex-1 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 uppercase">{tr.navMaintenance}</h1>
              <p className="text-slate-500 mt-1 font-medium">{tr.mtSubtitle}</p>
            </div>
            <Link
              href="/dashboard/manager/maintenance/new"
              className="rounded-full bg-gradient-to-r from-violet-500 to-blue-500 px-8 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.02] active:scale-95 uppercase tracking-wide"
            >
              {tr.mtNewTicket}
            </Link>
          </div>
        </div>

        {/* Nuove manutenzioni proposte dalle imprese */}
        {proposals.length > 0 && (
          <div className="rounded-2xl border border-violet-200 bg-violet-50/70 p-5 space-y-3">
            <h2 className="text-sm font-bold text-violet-800 flex items-center gap-2">
              🔧 Manutenzioni proposte dalle imprese
              <span className="rounded-full bg-violet-500 px-2 py-0.5 text-[11px] font-bold text-white">{proposals.length}</span>
            </h2>
            <div className="space-y-2">
              {proposals.map((p) => (
                <div key={p.id} className="rounded-xl border border-violet-100 bg-white p-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800">
                      {p.title}
                      {p.priority === "URGENT" && <span className="ml-2 rounded-full bg-red-100 px-1.5 py-0.5 text-[9px] font-semibold text-red-700">Urgente</span>}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {p.apartmentName} · {p.companyName}
                      {p.scheduledStart ? ` · proposto per ${fmtReqDate(p.scheduledStart)}` : ""}
                    </p>
                  </div>
                  <MaintenanceProposalDecision ticketId={p.id} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Richieste di cambio data dalle imprese */}
        {dateRequests.length > 0 && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 space-y-3">
            <h2 className="text-sm font-bold text-amber-800 flex items-center gap-2">
              📅 Richieste cambio data
              <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[11px] font-bold text-white">{dateRequests.length}</span>
            </h2>
            <div className="space-y-2">
              {dateRequests.map((r) => (
                <div key={r.id} className="rounded-xl border border-amber-100 bg-white p-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/dashboard/manager/maintenance/${r.ticketId}/edit`} className="text-sm font-semibold text-slate-800 hover:text-violet-600">{r.ticketTitle}</Link>
                    <p className="text-[11px] text-slate-500">
                      {r.apartmentName} · {r.companyName} · propone <strong>{fmtReqDate(r.proposedStart)}</strong>
                      {r.currentStart ? ` (attuale ${fmtReqDate(r.currentStart)})` : ""}
                    </p>
                    {r.reason && <p className="text-[11px] text-slate-400">Motivo: {r.reason}</p>}
                  </div>
                  <MaintenanceDateRequestDecision requestId={r.id} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* List */}
        <MaintenanceListTable
            initialTickets={tickets as any} 
            apartments={apartments} 
            collaborators={collaborators} 
        />

      </div>
    </main>
  );
}
