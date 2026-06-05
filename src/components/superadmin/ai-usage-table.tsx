"use client";

import { useState } from "react";
import { updateAILimits } from "@/src/app/actions/superadmin";

type OrgUsage = {
  id: string;
  name: string;
  tokens: { used: number; limit: number };
  perplexity: { used: number; limit: number };
};

function UsageBar({ used, limit, color }: { used: number; limit: number; color: string }) {
  const pct = Math.min(Math.round((used / limit) * 100), 100);
  const isHigh = pct >= 80;
  const barColor = isHigh ? "#ff3b30" : pct >= 50 ? "#ff9f0a" : color;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-[6px] rounded-full bg-slate-100 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: barColor }} />
      </div>
      <span className={`text-[11px] font-[700] tabular-nums ${isHigh ? "text-red-600" : "text-slate-500"}`}>{pct}%</span>
    </div>
  );
}

function EditLimitsModal({ org, onClose }: { org: OrgUsage; onClose: () => void }) {
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 w-[360px] shadow-2xl">
        <h3 className="text-[15px] font-[700] text-slate-900 mb-1">Modifica limiti AI</h3>
        <p className="text-[12px] text-slate-500 mb-5">{org.name}</p>
        <form
          action={async (fd) => {
            setSaving(true);
            await updateAILimits(
              org.id,
              parseInt(fd.get("tokenLimit") as string),
              parseInt(fd.get("perplexityLimit") as string),
            );
            setSaving(false);
            setDone(true);
            setTimeout(onClose, 800);
          }}
          className="flex flex-col gap-4"
        >
          <div>
            <label className="block text-[11px] font-[600] text-slate-500 uppercase tracking-wide mb-1.5">
              Token GPT mensili
            </label>
            <input
              name="tokenLimit"
              type="number"
              defaultValue={org.tokens.limit}
              min={100000}
              step={100000}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[14px] font-[600] outline-none focus:ring-2 focus:ring-violet-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">Default: 1.800.000 (~50 conv/giorno)</p>
          </div>
          <div>
            <label className="block text-[11px] font-[600] text-slate-500 uppercase tracking-wide mb-1.5">
              Richieste Perplexity mensili
            </label>
            <input
              name="perplexityLimit"
              type="number"
              defaultValue={org.perplexity.limit}
              min={0}
              step={50}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[14px] font-[600] outline-none focus:ring-2 focus:ring-violet-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">Default: 600 (~20/giorno)</p>
          </div>
          <div className="flex gap-2 justify-end mt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-[13px] font-[600] text-slate-600 hover:bg-slate-100 transition">Annulla</button>
            <button type="submit" disabled={saving || done} className="px-4 py-2 rounded-lg text-[13px] font-[600] bg-slate-900 text-white hover:bg-slate-700 transition disabled:opacity-60">
              {done ? "✓ Salvato" : saving ? "Salvo..." : "Salva"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AIUsageTable({ orgs }: { orgs: OrgUsage[] }) {
  const [editing, setEditing] = useState<OrgUsage | null>(null);

  const totalTokensUsed = orgs.reduce((s, o) => s + o.tokens.used, 0);
  const totalPerplexityUsed = orgs.reduce((s, o) => s + o.perplexity.used, 0);

  return (
    <div>
      {editing && <EditLimitsModal org={editing} onClose={() => setEditing(null)} />}

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-violet-50 rounded-xl p-3 border border-violet-100">
          <p className="text-[11px] font-[600] text-violet-600 uppercase tracking-wide mb-1">Token GPT questo mese</p>
          <p className="text-[22px] font-[800] text-violet-900">{totalTokensUsed.toLocaleString("it-IT")}</p>
          <p className="text-[11px] text-violet-500">su tutte le organizzazioni</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
          <p className="text-[11px] font-[600] text-blue-600 uppercase tracking-wide mb-1">Ricerche Perplexity questo mese</p>
          <p className="text-[22px] font-[800] text-blue-900">{totalPerplexityUsed.toLocaleString("it-IT")}</p>
          <p className="text-[11px] text-blue-500">su tutte le organizzazioni</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <div className="grid grid-cols-[1fr_1fr_1fr_80px] gap-4 px-4 py-2 border-b border-slate-100 bg-slate-50">
          <span className="text-[11px] font-[700] text-slate-500 uppercase tracking-wide">Organizzazione</span>
          <span className="text-[11px] font-[700] text-slate-500 uppercase tracking-wide">Token GPT</span>
          <span className="text-[11px] font-[700] text-slate-500 uppercase tracking-wide">Perplexity</span>
          <span className="text-[11px] font-[700] text-slate-500 uppercase tracking-wide">Limiti</span>
        </div>
        {orgs.map((org, i) => (
          <div
            key={org.id}
            className="grid grid-cols-[1fr_1fr_1fr_80px] gap-4 items-center px-4 py-3"
            style={{ borderBottom: i < orgs.length - 1 ? "1px solid #f1f5f9" : "none" }}
          >
            <div>
              <p className="text-[13px] font-[600] text-slate-900 truncate">{org.name}</p>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[12px] font-[700] text-slate-700">{org.tokens.used.toLocaleString("it-IT")}</span>
                <span className="text-[11px] text-slate-400">/ {org.tokens.limit.toLocaleString("it-IT")}</span>
              </div>
              <UsageBar used={org.tokens.used} limit={org.tokens.limit} color="#7c3aed" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[12px] font-[700] text-slate-700">{org.perplexity.used}</span>
                <span className="text-[11px] text-slate-400">/ {org.perplexity.limit}</span>
              </div>
              <UsageBar used={org.perplexity.used} limit={org.perplexity.limit} color="#2563eb" />
            </div>
            <div>
              <button
                onClick={() => setEditing(org)}
                className="text-[11px] font-[600] text-violet-600 hover:text-violet-800 hover:underline transition"
              >
                Modifica
              </button>
            </div>
          </div>
        ))}
        {orgs.length === 0 && (
          <div className="px-4 py-8 text-center text-[13px] text-slate-400">Nessuna organizzazione</div>
        )}
      </div>
    </div>
  );
}
