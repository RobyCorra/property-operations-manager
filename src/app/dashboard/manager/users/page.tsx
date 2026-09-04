import { cookies } from "next/headers";
import { getT } from "@/src/lib/server-lang";
import { redirect } from "next/navigation";
import { prisma } from "@/src/lib/prisma";
import { getCurrentOrg } from "@/src/lib/tenant";
import Link from "next/link";
import DeleteUserButton from "@/src/components/delete-user-button";
import SafeDate from "@/src/components/safe-date";
import BackButton from "@/src/components/back-button";
import TeamListMobile from "@/src/components/team-list-mobile";
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
  const tr = await getT();
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
        {/* Header */}
        <div className="sticky top-0 z-30 -mx-6 lg:-mx-10 px-6 lg:px-10 pb-4 -mt-6 lg:-mt-10 bg-[#faf8ff] flex flex-row items-center md:items-end justify-between gap-4 md:gap-6" style={{ paddingTop: "calc(env(safe-area-inset-top) + 16px)" }}>
          <div className="flex items-center gap-3 min-w-0">
            <BackButton />
            <h1 className="text-xl md:text-4xl font-bold md:font-semibold tracking-tight text-slate-900 md:uppercase truncate">
              {tr.navTeam}<span className="hidden md:inline text-violet-600"> .</span>
            </h1>
          </div>

          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            {/* Mobile: icone compatte. Desktop: bottoni con testo. */}
            <Link
              href="/dashboard/manager/users/history"
              aria-label={tr.usActivityHistory}
              className="w-10 h-10 md:w-auto md:h-auto md:px-8 md:py-3.5 flex items-center justify-center md:gap-3 bg-white border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-2xl md:rounded-full shadow-sm hover:shadow-md active:scale-95 whitespace-nowrap"
            >
              <Activity size={18} className="md:hidden" />
              <Activity size={16} className="hidden md:inline" />
              <span className="hidden md:inline">{tr.usActivityHistory}</span>
            </Link>
            <Link
              href="/dashboard/manager/users/new"
              aria-label={tr.usNewCollab}
              className="w-10 h-10 md:w-auto md:h-auto md:px-8 md:py-3.5 flex items-center justify-center md:gap-3 bg-gradient-to-r from-violet-600 to-blue-500 text-[10px] font-black text-white shadow-lg shadow-violet-200/50 hover:shadow-2xl active:scale-95 uppercase tracking-widest whitespace-nowrap rounded-2xl md:rounded-full"
            >
              <Plus size={20} className="md:hidden" />
              <Plus size={16} className="hidden md:inline" />
              <span className="hidden md:inline">{tr.usNewCollab}</span>
            </Link>
          </div>
        </div>

        {/* List — Desktop (table view) */}
        <section className="hidden md:block bg-white/40 backdrop-blur-xl rounded-[2rem] border border-white/40 shadow-2xl shadow-black/5 overflow-hidden transition-all duration-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 border-collapse">
              <thead className="bg-white/20 border-b border-white/40">
                <tr>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">{tr.usCollaborator}</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">{tr.usContact}</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">{tr.usAuthorizations}</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">{tr.usJoinDate}</th>
                  <th className="px-10 py-6 text-right text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">{tr.apColActions}</th>
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
                              title={tr.usEditUser}
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

        {/* List — Mobile (raggruppata per ruolo, Proposta A) */}
        <TeamListMobile
          users={users}
          canManage={role === "MANAGER"}
          protectedEmail="manager@propertyops.com"
        />

      </div>
    </main>
  );
}
