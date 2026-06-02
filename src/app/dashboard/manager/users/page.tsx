import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { getCurrentOrg } from "@/src/lib/tenant";
import Link from "next/link";
import DeleteUserButton from "@/src/components/delete-user-button";
import SafeDate from "@/src/components/safe-date";
import BackButton from "@/src/components/back-button";
import {
  User,
  Mail,
  Fingerprint,
  CalendarDays,
  Plus,
  Activity,
  Search,
  MoreVertical,
  Pencil
} from "@/src/components/icons";
import { Shield, CheckCircle } from "lucide-react";

type UserView = {
  id: string;
  name?: string | null;
  email?: string | null;
  role: string;
  createdAt: Date | string;
};

export default async function UsersListPage() {
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;

  if (role !== "MANAGER") {
    redirect("/login");
  }

  const orgId = await getCurrentOrg();

  const users = await prisma.user.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: "desc" },
  });

  const roleColors: Record<string, string> = {
    MANAGER:     "bg-slate-900 text-white border-slate-900 shadow-slate-200",
    CLEANER:     "bg-blue-500/10 text-blue-600 border-blue-200/50",
    MAINTENANCE: "bg-amber-500/10 text-amber-600 border-amber-200/50",
    SUPERVISOR:  "bg-yellow-500/10 text-yellow-700 border-yellow-200/50",
    OWNER:       "bg-emerald-500/10 text-emerald-700 border-emerald-200/50",
  };

  return (
    <main className="min-h-screen bg-[#faf8ff] p-6 lg:p-10 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto space-y-12">
        <BackButton />

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <h1 className="text-2xl md:text-4xl font-semibold tracking-tight text-slate-900 uppercase">
            Team <span className="text-violet-600">.</span>
          </h1>

          <div className="flex items-center gap-2 md:gap-4">
            <Link
              href="/dashboard/manager/users/history"
              className="flex items-center gap-3 px-4 md:px-8 py-2.5 md:py-3.5 bg-white border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-full transition-all duration-300 shadow-sm hover:shadow-md active:scale-95 whitespace-nowrap"
            >
              <Activity size={16} />
              <span className="md:hidden">Storico</span>
              <span className="hidden md:inline">Storico Attività</span>
            </Link>
            <Link
              href="/dashboard/manager/users/new"
              className="flex items-center gap-3 bg-gradient-to-r from-violet-600 to-blue-500 px-4 md:px-8 py-2.5 md:py-3.5 text-[10px] font-black text-white shadow-xl shadow-violet-200/50 transition-all duration-300 hover:shadow-2xl hover:scale-[1.03] active:scale-95 uppercase tracking-widest whitespace-nowrap rounded-full"
            >
              <Plus size={16} />
              <span className="md:hidden">Nuovo</span>
              <span className="hidden md:inline">Nuovo Collaboratore</span>
            </Link>
          </div>
        </div>

        {/* List — Desktop (table view) */}
        <section className="hidden md:block bg-white/40 backdrop-blur-xl rounded-[2rem] border border-white/40 shadow-2xl shadow-black/5 overflow-hidden transition-all duration-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 border-collapse">
              <thead className="bg-white/20 border-b border-white/40">
                <tr>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">Collaboratore</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">Contatto</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">Autorizzazioni</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">Data Iscrizione</th>
                  <th className="px-10 py-6 text-right text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50">
                {users.map((u: UserView) => (
                  <tr key={u.id} className="hover:bg-white/40 transition-all duration-200 group">
                    <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-slate-100">
                                <User size={18} />
                            </div>
                            <span className="text-sm font-semibold text-slate-900 tracking-tight uppercase">
                                {u.name}
                            </span>
                        </div>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-2 text-slate-500 font-medium lowercase">
                          <Mail size={14} className="text-slate-300" />
                          {u.email}
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm ${roleColors[u.role] || "bg-white text-slate-400 border-slate-100"}`}>
                        <Fingerprint size={12} />
                        {u.role}
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                        <CalendarDays size={14} className="text-slate-200" />
                        <SafeDate date={u.createdAt} format={{ day: 'numeric', month: 'numeric', year: 'numeric' }} />
                      </div>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {role === "MANAGER" && u.email !== "manager@propertyops.com" && (
                          <>
                            <Link
                              href={`/dashboard/manager/users/${u.id}/edit`}
                              className="w-10 h-10 flex items-center justify-center rounded-full text-slate-300 hover:text-violet-600 hover:bg-violet-50 transition-all"
                              title="Modifica utente"
                            >
                              <Pencil size={16} />
                            </Link>
                            <DeleteUserButton id={u.id} />
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* List — Mobile (card view) */}
        <div className="md:hidden space-y-2">
          {users.map((u: UserView) => (
            <div key={u.id} className="bg-white/40 backdrop-blur-xl rounded-xl border border-white/40 shadow-sm overflow-hidden transition-all duration-200 hover:bg-white/60">
              <div className="p-3 space-y-2">
                {/* Name and Role */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                      <User size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-900 tracking-tight uppercase truncate">{u.name}</p>
                      <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest border shadow-sm mt-0.5 ${roleColors[u.role] || "bg-white text-slate-400 border-slate-100"}`}>
                        <Fingerprint size={8} />
                        {u.role}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-1.5 text-slate-500 font-medium lowercase text-[9px]">
                  <Mail size={10} className="text-slate-300 shrink-0" />
                  <span className="truncate">{u.email}</span>
                </div>

                {/* Date */}
                <div className="flex items-center gap-1.5 text-slate-400 text-[8px] font-bold uppercase tracking-widest">
                  <CalendarDays size={10} className="text-slate-300 shrink-0" />
                  <SafeDate date={u.createdAt} format={{ day: 'numeric', month: 'numeric', year: 'numeric' }} />
                </div>

                {/* Actions */}
                {role === "MANAGER" && u.email !== "manager@propertyops.com" && (
                  <div className="flex items-center gap-1.5 pt-1.5 border-t border-white/20">
                    <Link
                      href={`/dashboard/manager/users/${u.id}/edit`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-all text-[8px] font-bold"
                      title="Modifica utente"
                    >
                      <Pencil size={12} />
                      Modifica
                    </Link>
                    <div className="flex-1">
                      <DeleteUserButton id={u.id} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
