import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/src/lib/prisma";
import { logoutAction } from "@/src/app/actions/auth";
import CheckinStartButton from "@/src/components/checkin-start-button";
import CheckinCardChat from "@/src/components/checkin-card-chat";
import { formatRomeDateTimeDisplay } from "@/src/lib/rome-datetime";

export const revalidate = 0;

export default async function CheckinDashboardPage() {
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;
  const userId = cookieStore.get("userId")?.value;
  const orgId = cookieStore.get("organizationId")?.value;

  if (role !== "CHECKIN" || !userId) {
    redirect("/login");
  }

  const [user, tasks] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { name: true } }),
    prisma.checkinTask.findMany({
      where: {
        OR: [
          // Assegnati a me (qualsiasi stato attivo)
          { assignedToId: userId, status: { in: ["PENDING", "IN_PROGRESS", "COMPLETED"] } },
          // Non assegnati nella mia organizzazione (da prendere)
          { assignedToId: null, status: "PENDING", apartment: { organizationId: orgId } },
        ],
      },
      include: {
        apartment: { select: { name: true, address: true } },
        booking: { select: { guestName: true, totalGuests: true } },
        messages: { orderBy: { createdAt: "asc" }, include: { attachment: true } },
      },
      orderBy: { date: "asc" },
    }),
  ]);

  return (
    <main className="min-h-screen bg-[#faf8ff] pb-10" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <header className="px-5 pt-5 pb-3 flex items-center justify-between">
        <div>
          <p className="text-lg font-semibold text-slate-900">Ciao, {user?.name ?? "Assistente"}</p>
          <p className="text-sm text-slate-500">I tuoi check-in</p>
        </div>
        <form action={logoutAction}>
          <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-200 rounded-full px-4 py-2 bg-white">
            Esci
          </button>
        </form>
      </header>

      <div className="px-5 space-y-3">
        {tasks.length === 0 && (
          <p className="text-sm text-slate-400 text-center py-16">Nessun check-in assegnato.</p>
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
                  {isDone ? "Completato" : inProgress ? "In corso" : "Da fare"}
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
                <CheckinStartButton taskId={task.id} taskDate={task.date.toISOString()} />
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
    </main>
  );
}
