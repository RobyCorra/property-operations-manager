"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Pencil } from "lucide-react";
import { useLang } from "@/src/components/lang-context";
import DeleteUserButton from "@/src/components/delete-user-button";

type TeamUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role: string;
  createdAt: Date | string;
};

// Ordine e stile per ruolo
const ROLE_ORDER = ["MANAGER", "SUPERVISOR", "CLEANER", "MAINTENANCE", "OWNER"];

const AV_GRAD: Record<string, string> = {
  MANAGER: "linear-gradient(135deg,#334155,#0f172a)",
  SUPERVISOR: "linear-gradient(135deg,#eab308,#ca8a04)",
  CLEANER: "linear-gradient(135deg,#3b82f6,#6366f1)",
  MAINTENANCE: "linear-gradient(135deg,#f59e0b,#f97316)",
  OWNER: "linear-gradient(135deg,#10b981,#059669)",
};

function roleGroupLabel(role: string, lang: string): string {
  const map: Record<string, [string, string, string]> = {
    MANAGER: ["Manager", "Managers", "Managers"],
    SUPERVISOR: ["Supervisori", "Supervisors", "Supervisores"],
    CLEANER: ["Addetti pulizie", "Cleaners", "Limpieza"],
    MAINTENANCE: ["Manutenzione", "Maintenance", "Mantenimiento"],
    OWNER: ["Proprietari", "Owners", "Propietarios"],
  };
  const e = map[role] ?? [role, role, role];
  return lang === "en" ? e[1] : lang === "es" ? e[2] : e[0];
}

function initials(u: TeamUser): string {
  const src = (u.name || u.email || "?").trim();
  const parts = src.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return src.slice(0, 2).toUpperCase();
}

export default function TeamListMobile({
  users,
  canManage,
  protectedEmail,
}: {
  users: TeamUser[];
  canManage: boolean;
  protectedEmail: string;
}) {
  const { t, lang } = useLang();
  const [search, setSearch] = useState("");

  const groups = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = users.filter(
      (u) => !q || (u.name || "").toLowerCase().includes(q) || (u.email || "").toLowerCase().includes(q)
    );
    const byRole: Record<string, TeamUser[]> = {};
    for (const u of filtered) {
      (byRole[u.role] ??= []).push(u);
    }
    const orderedRoles = [
      ...ROLE_ORDER.filter((r) => byRole[r]?.length),
      ...Object.keys(byRole).filter((r) => !ROLE_ORDER.includes(r)),
    ];
    return orderedRoles.map((role) => ({ role, items: byRole[role] }));
  }, [users, search]);

  const total = groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <div className="md:hidden">
      {/* Ricerca */}
      <div className="flex items-center gap-2 bg-white border border-[#ede9f6] rounded-2xl px-3.5 py-2.5 mb-3">
        <Search size={15} className="text-slate-400 shrink-0" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cerca nome…"
          className="flex-1 min-w-0 bg-transparent outline-none text-[15px] text-slate-700 placeholder:text-slate-400"
        />
      </div>

      {total === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">Nessun membro trovato</div>
      ) : (
        <div className="space-y-5">
          {groups.map((g) => (
            <div key={g.role}>
              <div className="flex items-center gap-2 mb-2">
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">{roleGroupLabel(g.role, lang ?? "it")}</p>
                <span className="text-[10px] font-black text-slate-500 bg-slate-100 rounded-full px-2 py-0.5">{g.items.length}</span>
                <span className="flex-1 h-px bg-slate-200" />
              </div>
              <div className="space-y-2">
                {g.items.map((u) => {
                  const editable = canManage && u.email !== protectedEmail;
                  return (
                    <div key={u.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm px-3 py-2.5 flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center text-white font-extrabold text-sm shrink-0"
                        style={{ background: AV_GRAD[u.role] ?? "linear-gradient(135deg,#94a3b8,#64748b)" }}
                      >
                        {initials(u)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{u.name || u.email}</p>
                        <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                      </div>
                      {editable && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Link
                            href={`/dashboard/manager/users/${u.id}/edit`}
                            aria-label={t.usEditUser}
                            className="w-9 h-9 rounded-xl bg-[#f3f1fa] text-violet-600 flex items-center justify-center active:scale-95 transition-transform"
                          >
                            <Pencil size={15} />
                          </Link>
                          <DeleteUserButton id={u.id} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
