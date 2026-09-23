import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/src/lib/prisma";
import { logoutAction } from "@/src/app/actions/auth";
import CheckinStartButton from "@/src/components/checkin-start-button";
import CheckinCardChat from "@/src/components/checkin-card-chat";
import { isCheckinBlockedByCleaning } from "@/src/app/actions/checkin";
import { formatRomeDateTimeDisplay } from "@/src/lib/rome-datetime";
import { getT } from "@/src/lib/server-lang";
import OrgStaffMessagesButton from "@/src/components/org-staff-messages-button";
import { LogOut } from "@/src/components/icons";
import { DoorOpen } from "lucide-react";

export const revalidate = 0;

export default async function CheckinDashboardPage() {
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;
  const userId = cookieStore.get("userId")?.value;

  if (role !== "CHECKIN" || !userId) {
    redirect("/login");
  }

  const tr = await getT();

  const [user, tasks] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { name: true, companyId: true, organizationId: true } }),
    prisma.checkinTask.findMany({
      where: {
        // Solo i check-in assegnati all'assistente corrente.
        assignedToId: userId,
        status: { in: ["PENDING", "IN_PROGRESS", "COMPLETED"] },
      },
      include: {
        apartment: { select: { name: true, address: true } },
        booking: { select: { guestName: true, totalGuests: true } },
        messages: { orderBy: { createdAt: "asc" }, include: { attachment: true } },
      },
      orderBy: { date: "asc" },
    }),
  ]);

  // Per ogni check-in PENDING, verifica se la pulizia di check-out blocca l'avvio.
  const blockedByCleaning = new Map<string, boolean>();
  await Promise.all(
    tasks
      .filter((t) => t.status === "PENDING")
      .map(async (t) => {
        blockedByCleaning.set(t.id, await isCheckinBlockedByCleaning(t.apartmentId, t.date));
      })
  );

  const isOrgWorker = user && !user.companyId && user.organizationId;
  const orgStaffUnread = isOrgWorker
    ? await prisma.orgStaffMessage.count({
        where: { organizationId: user.organizationId!, staffUserId: userId, senderIsManager: true, readByStaffAt: null },
      }).catch(() => 0)
    : 0;

  return (
    <main className="min-h-screen bg-[#faf8ff] pb-24 md:pb-10" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <header className="px-5 pt-5 pb-3 flex items-center justify-between">
        <div>
          <p className="text-lg font-semibold text-slate-900">Ciao, {user?.name ?? "Assistente"}</p>
          <p className="text-sm text-slate-500">I tuoi check-in</p>
        </div>
        <div className="flex items-center gap-2">
          {isOrgWorker && (
            <div className="hidden md:block">
              <OrgStaffMessagesButton initialUnread={orgStaffUnread} variant="desktop" />
            </div>
          )}
          <form action={logoutAction}>
            <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-200 rounded-full px-4 py-2 bg-white">
              Esci
            </button>
          </form>
        </div>
      </header>

      <div className="px-5 space-y-3">
        {tasks.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-16">{tr.cikNoAssigned}</p>
        )}

        {tasks.map((task) => {
          const isDone = task.status === "COMPLETED";
          const inProgress = task.status === "IN_PROGRESS";
          return (
            <div
              key={task.id}
              className={`bg-white rounded-2xl border p-4 ${
                inProgress ? "border-violet-200 ring-2 ring-violet-500/20" : "border-slate-100"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                    isDone
                      ? "bg-emerald-50 text-emerald-600"
                      : inProgress
                      ? "bg-violet-50 text-violet-600"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {isDone ? tr.staCompleted : inProgress ? tr.staInProgress : tr.staTodo}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  {formatRomeDateTimeDisplay(task.date)}
                </span>
              </div>

              <p className="text-base font-semibold text-slate-900">{task.apartment.name}</p>
              <p className="text-xs text-slate-500 mb-3">
                {task.apartment.address}
                {task.booking?.guestName ? ` · Ospite: ${task.booking.guestName}` : ""}
                {task.booking?.totalGuests ? ` · ${task.booking.totalGuests} persone` : ""}
              </p>

              {task.status === "PENDING" && (
                <CheckinStartButton
                  taskId={task.id}
                  taskDate={task.date.toISOString()}
                  cleaningBlocked={blockedByCleaning.get(task.id) ?? false}
                />
              )}
              {inProgress && (
                <Link
                  href={`/dashboard/checkin/task/${task.id}`}
                  className="block w-full text-center py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 text-white text-[10px] font-black uppercase tracking-widest"
                >
                  Continua check-in
                </Link>
              )}
              {isDone && (
                <Link
                  href={`/dashboard/checkin/task/${task.id}`}
                  className="block w-full text-center py-3 rounded-xl bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest border border-slate-100"
                >
                  Rivedi
                </Link>
              )}

              <CheckinCardChat
                taskId={task.id}
                initialMessages={task.messages}
                currentUserName={user?.name ?? "Assistente"}
                hasUnread={task.messages.some((m) => m.role === "MANAGER" && !m.readByWorkerAt)}
              />
            </div>
          );
        })}
      </div>

      {isOrgWorker && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-stretch border-t border-slate-200 bg-white/95 backdrop-blur-md md:hidden safe-bottom">
          <Link
            href="/dashboard/checkin"
            className="flex flex-1 flex-col items-center justify-center gap-1 py-3 text-violet-600"
          >
            <DoorOpen size={20} />
            <span className="text-[9px] font-black uppercase tracking-widest">Check-in</span>
          </Link>
          <OrgStaffMessagesButton initialUnread={orgStaffUnread} variant="mobile" />
          <form action={logoutAction} className="flex flex-1">
            <button type="submit" className="flex flex-1 flex-col items-center justify-center gap-1 py-3 text-slate-400 hover:text-rose-500">
              <LogOut size={20} />
              <span className="text-[9px] font-black uppercase tracking-widest">Esci</span>
            </button>
          </form>
        </nav>
      )}
    </main>
  );
}
