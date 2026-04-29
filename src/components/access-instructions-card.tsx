"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { KeyRound } from "@/src/components/icons";

type AccessInstructionsCardProps = {
  accessInstructions?: string | null;
};

function getAccessCode(value: string) {
  return value.match(/(?:codice|code|pin)\D{0,20}([A-Z0-9#*-]{3,12})/i)?.[1]
    ?? value.match(/\b\d{4,8}\b/)?.[0]
    ?? "";
}

export default function AccessInstructionsCard({ accessInstructions }: AccessInstructionsCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const compactText = accessInstructions ? `${accessInstructions.slice(0, 80)}${accessInstructions.length > 80 ? "..." : ""}` : "";
  const accessCode = accessInstructions ? getAccessCode(accessInstructions) : "";

  if (!accessInstructions) {
    return (
      <div className="h-full bg-slate-50 border border-slate-100 p-5 rounded-3xl flex items-center text-xs text-slate-400 font-medium uppercase tracking-tight">
        Accedere con le istruzioni standard o contattare il manager.
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="h-full w-full bg-violet-500/5 border border-violet-500/10 p-5 rounded-3xl flex gap-5 text-left transition-colors hover:bg-violet-500/10"
      >
        <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shrink-0 border border-violet-500/10 text-violet-600 shadow-sm">
          <KeyRound size={20} />
        </div>
        <div className="min-w-0">
          <p className="text-[9px] font-black text-violet-600 uppercase tracking-widest mb-1">Istruzioni Accesso</p>
          {accessCode && (
            <p className="mb-1 text-lg font-black tracking-tight text-slate-900">🔑 {accessCode}</p>
          )}
          <p className="line-clamp-1 text-sm text-slate-700 font-medium leading-relaxed">{compactText}</p>
          <span className="mt-2 inline-flex text-[10px] font-black uppercase tracking-widest text-violet-600">
            Leggi tutto
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl overflow-hidden rounded-[2rem] border border-white/60 bg-white shadow-2xl shadow-black/20">
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-6 py-5">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">Istruzioni Accesso</h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900"
                aria-label="Chiudi popup istruzioni accesso"
              >
                <X size={16} />
              </button>
            </div>
            <div className="max-h-[55vh] overflow-y-auto px-6 py-5">
              <p className="whitespace-pre-wrap text-sm font-medium leading-relaxed text-slate-700">{accessInstructions}</p>
            </div>
            <div className="flex justify-end border-t border-slate-100 px-6 py-4">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full bg-slate-900 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white transition-colors hover:bg-slate-700"
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
