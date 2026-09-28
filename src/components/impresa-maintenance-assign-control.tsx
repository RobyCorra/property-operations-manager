"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { assignMaintenance } from "@/src/app/actions/company";

type Staff = { id: string; name: string };

export default function ImpresaMaintenanceAssignControl({
  ticketId,
  staff,
  assignedToId,
}: {
  ticketId: string;
  staff: Staff[];
  assignedToId: string | null;
}) {
  const router = useRouter();
  const [value, setValue] = useState<string>(assignedToId ?? "");
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onChange(v: string) {
    setValue(v);
    setError(null);
    startTransition(async () => {
      const r = await assignMaintenance(ticketId, v || null);
      if (r.success) { setSaved(true); setTimeout(() => setSaved(false), 1500); router.refresh(); }
      else setError(r.error);
    });
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={isPending || staff.length === 0}
        className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm text-gray-800 focus:outline-none disabled:opacity-50"
      >
        <option value="">Non assegnato</option>
        {staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>
      {saved && <span className="text-[11px] font-semibold text-emerald-600">Salvato</span>}
      {error && <span className="text-[11px] text-red-500">{error}</span>}
      {staff.length === 0 && <span className="text-[11px] text-gray-400">Aggiungi operatori in Staff</span>}
    </div>
  );
}
