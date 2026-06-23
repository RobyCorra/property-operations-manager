import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { logoutAction } from "@/src/app/actions/auth";
import TimelineCalendar from "@/src/components/timeline-calendar";
import { LogOut, Home } from "lucide-react";

export default async function OwnerDashboardPage() {
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;
  const userId = cookieStore.get("userId")?.value;

  if (role !== "OWNER" || !userId) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) redirect("/login");

  const assignedApartmentIds = (
    await prisma.apartmentOwner.findMany({ where: { userId }, select: { apartmentId: true } })
  ).map(a => a.apartmentId);

  const [apartments, bookings, cleaningTasks, maintenanceTickets] = await Promise.all([
    prisma.apartment.findMany({
      where: { id: { in: assignedApartmentIds } },
    }),
    prisma.booking.findMany({
      where: { apartmentId: { in: assignedApartmentIds }, status: { not: "CANCELLED" } },
      include: { apartment: { select: { name: true, address: true } } },
    }),
    prisma.cleaningTask.findMany({
      where: { apartmentId: { in: assignedApartmentIds }, status: { not: "CANCELLED" } },
      include: {
        apartment: { select: { name: true } },
        assignedTo: { select: { name: true } },
      },
    }),
    prisma.maintenanceTicket.findMany({
      where: { apartmentId: { in: assignedApartmentIds }, status: { notIn: ["CANCELLED", "RESOLVED", "APPROVED"] } },
      include: {
        apartment: { select: { name: true } },
        assignedTo: { select: { name: true } },
      },
    }),
  ]);

  const serverDate = new Date().toISOString();

  return (
    <main className="min-h-screen bg-[#faf8ff] font-sans text-slate-900">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 lg:px-10 lg:pt-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-slate-900 uppercase">
              Calendario <span className="text-emerald-500">.</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">
              Ciao, {user.name} — calendario operativo dei tuoi appartamenti
            </p>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-full bg-emerald-100 border border-emerald-200 px-4 py-2">
              <Home size={14} className="text-emerald-600" />
              <span className="text-xs font-black uppercase tracking-widest text-emerald-700">
                {apartments.length} {apartments.length === 1 ? "appartamento" : "appartamenti"}
              </span>
            </div>
            <form action={logoutAction}>
              <button className="w-12 h-12 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-100 transition-all shadow-sm">
                <LogOut size={20} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {apartments.length === 0 ? (
        <div className="px-6 lg:px-10 max-w-7xl mx-auto">
          <div className="bg-white/40 backdrop-blur-xl p-20 rounded-[3rem] border border-slate-200 border-dashed text-center">
            <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl border border-slate-100">
              <Home size={48} className="text-emerald-500" />
            </div>
            <h3 className="text-2xl font-semibold text-slate-900 tracking-tight uppercase">Nessun Appartamento</h3>
            <p className="text-slate-500 text-sm mt-2 font-medium">Non hai ancora appartamenti assegnati. Contatta il manager.</p>
          </div>
        </div>
      ) : (
        <div className="px-2 lg:px-4 pb-10">
          <TimelineCalendar
            apartments={apartments as any}
            bookings={bookings as any}
            cleaningTasks={cleaningTasks as any}
            maintenanceTickets={maintenanceTickets as any}
            serverDate={serverDate}
            readOnly
          />
        </div>
      )}

      {/* Bottom nav — mobile only */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-stretch border-t border-slate-200 bg-white/95 backdrop-blur-md md:hidden safe-bottom">
        <div className="flex flex-1 flex-col items-center justify-center gap-1 py-3 text-emerald-600">
          <Home size={20} />
          <span className="text-[9px] font-black uppercase tracking-widest">Calendario</span>
        </div>
        <form action={logoutAction} className="flex flex-1">
          <button type="submit" className="flex flex-1 flex-col items-center justify-center gap-1 py-3 text-slate-400 hover:text-rose-500">
            <LogOut size={20} />
            <span className="text-[9px] font-black uppercase tracking-widest">Esci</span>
          </button>
        </form>
      </nav>
    </main>
  );
}
