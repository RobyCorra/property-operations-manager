import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/src/lib/prisma";
import { logoutAction } from "@/src/app/actions/auth";
import { formatRomeDateDisplay } from "@/src/lib/rome-datetime";
import { LogOut, ClipboardList, Wrench, Home, Clock, Building2 } from "lucide-react";
import PushPermissionRequest from "@/src/components/push-permission";

export default async function SupervisorDashboardPage() {
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;
  const userId = cookieStore.get("userId")?.value;

  if ((role !== "SUPERVISOR" && role !== "MANAGER") || !userId) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) redirect("/login");

  // For SUPERVISOR: only assigned apartments. For MANAGER: all apartments.
  let assignedApartments: { id: string; name: string; address: string }[] = [];
  let assignedApartmentIds: string[] | undefined;

  if (role === "SUPERVISOR") {
    const rows = await prisma.apartmentSupervisor.findMany({
      where: { userId },
      include: { apartment: { select: { id: true, name: true, address: true } } },
    });
    assignedApartments = rows.map(r => r.apartment);
    assignedApartmentIds = assignedApartments.map(a => a.id);
  }

  const apartmentFilter = assignedApartmentIds
    ? assignedApartmentIds.length > 0 ? { id: { in: assignedApartmentIds } } : { id: "never-match" }
    : {};

  const [allCleaningTasks, maintenanceTickets] = await Promise.all([
    prisma.cleaningTask.findMany({
      where: {
        status: { in: ["AWAITING_REVIEW", "IN_PROGRESS"] },
        apartment: apartmentFilter,
      },
      include: {
        apartment: { select: { name: true } },
        assignedTo: { select: { name: true } },
        booking: { select: { guestName: true } },
      },
      orderBy: { date: "asc" },
    }),
    prisma.maintenanceTicket.findMany({
      where: {
        status: { in: ["AWAITING_REVIEW", "IN_PROGRESS"] },
        apartment: apartmentFilter,
      },
      include: {
        apartment: { select: { name: true } },
        assignedTo: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Split cleanings: those needing review vs those sent back to cleaner for corrections
  const cleaningTasks = allCleaningTasks.filter(t => t.status === "AWAITING_REVIEW");
  const correctionPendingTasks = allCleaningTasks.filter(
    t => t.status === "IN_PROGRESS" &&
    Array.isArray(t.correctionProgress) &&
    (t.correctionProgress as unknown[]).length > 0
  );

  // Split tickets: needing review vs sent back for corrections
  const ticketsToReview = maintenanceTickets.filter(t => t.status === "AWAITING_REVIEW");
  const ticketsCorrectionPending = maintenanceTickets.filter(
    t => t.status === "IN_PROGRESS" &&
    Array.isArray(t.correctionProgress) &&
    (t.correctionProgress as unknown[]).length > 0
  );

  const totalToReview = cleaningTasks.length + ticketsToReview.length;
  const totalPending = correctionPendingTasks.length + ticketsCorrectionPending.length;

  return (
    <>
    <main className="min-h-screen bg-[#faf8ff] p-6 pb-28 font-sans text-slate-900 lg:p-10 lg:pb-10">
      <div className="max-w-4xl mx-auto space-y-10">

        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 uppercase">
              Revisioni <span className="text-yellow-500">.</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">Ciao, {user.name} — interventi in attesa di approvazione</p>
          </div>
          <div className="hidden md:flex items-center gap-4">
            {totalToReview > 0 && (
              <div className="flex items-center gap-2 rounded-full bg-yellow-100 border border-yellow-200 px-4 py-2">
                <Clock size={14} className="text-yellow-600" />
                <span className="text-xs font-black uppercase tracking-widest text-yellow-700">
                  {totalToReview} da revisionare
                </span>
              </div>
            )}
            <form action={logoutAction}>
              <button className="w-12 h-12 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-100 transition-all shadow-sm">
                <LogOut size={20} />
              </button>
            </form>
          </div>
        </div>

        {/* Assigned apartments — visible only for SUPERVISOR */}
        {role === "SUPERVISOR" && (
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <Building2 size={16} className="text-slate-500" />
              <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-700">Appartamenti assegnati</h2>
              <div className="h-px flex-1 bg-slate-200/50" />
            </div>
            {assignedApartments.length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white/30 p-8 text-center">
                <p className="text-sm text-slate-400 font-medium">Nessun appartamento assegnato al tuo account.<br />Contatta il manager per ricevere un incarico.</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {assignedApartments.map(apt => (
                  <div key={apt.id} className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/55 px-5 py-4 shadow-sm backdrop-blur-xl">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-50 border border-yellow-100">
                      <Home size={18} className="text-yellow-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 uppercase tracking-tight truncate">{apt.name}</p>
                      <p className="text-xs text-slate-400 font-medium truncate">{apt.address}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {totalToReview === 0 && (
          <div className="bg-white/40 backdrop-blur-xl p-20 rounded-[3rem] border border-slate-200 border-dashed text-center">
            <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl border border-slate-100">
              <ClipboardList size={48} className="text-yellow-500" />
            </div>
            <h3 className="text-2xl font-semibold text-slate-900 tracking-tight uppercase">Tutto Revisionato</h3>
            <p className="text-slate-500 text-sm mt-2 font-medium">Nessun intervento in attesa di revisione al momento.</p>
          </div>
        )}

        {/* Cleaning Tasks */}
        {cleaningTasks.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <ClipboardList size={16} className="text-violet-600" />
              <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-700">Pulizie in attesa</h2>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-100 text-[10px] font-black text-violet-700">{cleaningTasks.length}</span>
              <div className="h-px flex-1 bg-slate-200/50" />
            </div>
            <div className="grid gap-4">
              {cleaningTasks.map(task => (
                <Link
                  key={task.id}
                  href={`/dashboard/supervisor/review/cleaning/${task.id}`}
                  className="group block rounded-[2rem] border border-white/60 bg-white/55 p-5 shadow-lg shadow-black/5 backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:scale-[1.01] hover:border-violet-200"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 border border-yellow-200 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-yellow-700">
                          <Clock size={10} />
                          In verifica
                        </span>
                        {!task.assignedTo && (
                          <span className="rounded-full bg-rose-100 border border-rose-200 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-rose-700">Non assegnata</span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold uppercase tracking-tight text-slate-900">{task.apartment.name}</h3>
                      <p className="mt-1 text-xs font-medium text-slate-500">
                        {formatRomeDateDisplay(task.date)}
                        {task.assignedTo && <span className="ml-2">· {task.assignedTo.name}</span>}
                        {task.booking?.guestName && <span className="ml-2 text-slate-400">· Ospite: {task.booking.guestName}</span>}
                      </p>
                    </div>
                    <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 group-hover:bg-violet-50 group-hover:border-violet-200 transition-colors">
                      <ClipboardList size={18} className="text-slate-400 group-hover:text-violet-600" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Maintenance Tickets — to review */}
        {ticketsToReview.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <Wrench size={16} className="text-slate-600" />
              <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-700">Manutenzioni in attesa</h2>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[10px] font-black text-slate-600">{ticketsToReview.length}</span>
              <div className="h-px flex-1 bg-slate-200/50" />
            </div>
            <div className="grid gap-4">
              {ticketsToReview.map(ticket => (
                <Link
                  key={ticket.id}
                  href={`/dashboard/supervisor/review/maintenance/${ticket.id}`}
                  className="group block rounded-[2rem] border border-white/60 bg-white/55 p-5 shadow-lg shadow-black/5 backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:scale-[1.01] hover:border-slate-300"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 border border-yellow-200 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-yellow-700">
                          <Clock size={10} />
                          In verifica
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold uppercase tracking-tight text-slate-900">{ticket.title}</h3>
                      <p className="mt-1 text-xs font-medium text-slate-500">
                        <span className="inline-flex items-center gap-1"><Home size={10} />{ticket.apartment.name}</span>
                        {ticket.assignedTo && <span className="ml-2">· {ticket.assignedTo.name}</span>}
                      </p>
                    </div>
                    <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 group-hover:bg-slate-100 group-hover:border-slate-200 transition-colors">
                      <Wrench size={18} className="text-slate-400 group-hover:text-slate-600" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Pulizie — in attesa di correzione dal cleaner */}
        {correctionPendingTasks.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <ClipboardList size={16} className="text-rose-500" />
              <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-700">Pulizie — correzioni richieste</h2>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-100 text-[10px] font-black text-rose-600">{correctionPendingTasks.length}</span>
              <div className="h-px flex-1 bg-slate-200/50" />
            </div>
            <div className="grid gap-4">
              {correctionPendingTasks.map(task => (
                <div
                  key={task.id}
                  className="rounded-[2rem] border border-rose-100 bg-rose-50/40 p-5 shadow-sm backdrop-blur-xl"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 border border-rose-200 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-rose-700">
                          <Clock size={10} />
                          In attesa del cleaner
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold uppercase tracking-tight text-slate-900">{task.apartment.name}</h3>
                      <p className="mt-1 text-xs font-medium text-slate-500">
                        {formatRomeDateDisplay(task.date)}
                        {task.assignedTo && <span className="ml-2">· {task.assignedTo.name}</span>}
                      </p>
                    </div>
                    <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-2xl bg-rose-100 border border-rose-200">
                      <ClipboardList size={18} className="text-rose-500" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Manutenzioni — in attesa di correzione */}
        {ticketsCorrectionPending.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <Wrench size={16} className="text-rose-500" />
              <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-700">Manutenzioni — correzioni richieste</h2>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-100 text-[10px] font-black text-rose-600">{ticketsCorrectionPending.length}</span>
              <div className="h-px flex-1 bg-slate-200/50" />
            </div>
            <div className="grid gap-4">
              {ticketsCorrectionPending.map(ticket => (
                <div
                  key={ticket.id}
                  className="rounded-[2rem] border border-rose-100 bg-rose-50/40 p-5 shadow-sm backdrop-blur-xl"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 border border-rose-200 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-rose-700">
                          <Clock size={10} />
                          In attesa del tecnico
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold uppercase tracking-tight text-slate-900">{ticket.title}</h3>
                      <p className="mt-1 text-xs font-medium text-slate-500">
                        <span className="inline-flex items-center gap-1"><Home size={10} />{ticket.apartment.name}</span>
                        {ticket.assignedTo && <span className="ml-2">· {ticket.assignedTo.name}</span>}
                      </p>
                    </div>
                    <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-2xl bg-rose-100 border border-rose-200">
                      <Wrench size={18} className="text-rose-500" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Bottom nav — mobile only */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-stretch border-t border-slate-200 bg-white/95 backdrop-blur-md md:hidden safe-bottom">
        <div className="flex flex-1 flex-col items-center justify-center gap-1 py-3 text-yellow-500 relative">
          <ClipboardList size={20} />
          <span className="text-[9px] font-black uppercase tracking-widest">Revisioni</span>
          {totalToReview > 0 && (
            <span className="absolute top-2 right-[calc(50%-10px)] flex h-4 w-4 items-center justify-center rounded-full bg-yellow-500 text-[8px] font-black text-white">{totalToReview}</span>
          )}
        </div>
        <form action={logoutAction} className="flex flex-1">
          <button type="submit" className="flex flex-1 flex-col items-center justify-center gap-1 py-3 text-slate-400 hover:text-rose-500">
            <LogOut size={20} />
            <span className="text-[9px] font-black uppercase tracking-widest">Esci</span>
          </button>
        </form>
      </nav>
    </main>
    <PushPermissionRequest />
    </>
  );
}
