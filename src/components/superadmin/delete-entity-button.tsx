"use client";

import { useState } from "react";
import { deleteOrganization, deleteCompanyPlatform } from "@/src/app/actions/superadmin";

export default function DeleteEntityButton({
  kind,
  id,
  name,
}: {
  kind: "org" | "company";
  id: string;
  name: string;
}) {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const label = kind === "company" ? "impresa" : "organizzazione";
  const action = kind === "company" ? deleteCompanyPlatform : deleteOrganization;
  const fieldName = kind === "company" ? "companyId" : "orgId";
  const canDelete = confirmText.trim() === name.trim();

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-4 py-2 rounded-lg bg-red-600/90 hover:bg-red-500 text-white text-xs font-bold transition-all"
      >
        🗑 Elimina {label}
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-red-300">
        Questa azione è <strong>irreversibile</strong>. Verranno eliminati definitivamente tutti i dati
        {kind === "company"
          ? " dell'impresa (utenti, deleghe, messaggi, magazzino)."
          : " dell'organizzazione (utenti, appartamenti, prenotazioni, pulizie, ticket, messaggi)."}
      </p>
      <p className="text-xs text-slate-400">
        Per confermare, scrivi il nome esatto: <span className="font-mono text-white">{name}</span>
      </p>
      <form action={action} className="flex flex-col sm:flex-row gap-2">
        <input type="hidden" name={fieldName} value={id} />
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder={name}
          className="flex-1 rounded-lg bg-slate-800 border border-slate-600 px-3 py-2 text-white text-sm placeholder-slate-600 outline-none focus:ring-2 focus:ring-red-500"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={!canDelete}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Elimina definitivamente
          </button>
          <button
            type="button"
            onClick={() => { setOpen(false); setConfirmText(""); }}
            className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-bold transition-all"
          >
            Annulla
          </button>
        </div>
      </form>
    </div>
  );
}
