"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import AIAssistant from "@/src/components/ai-assistant";

type ManagerAIChatProps = {
  apartmentId?: string;
  apartmentName?: string;
  isOpen: boolean;
  onClose: () => void;
};

export default function ManagerAIChat({
  apartmentId,
  apartmentName,
  isOpen,
  onClose,
}: ManagerAIChatProps) {
  useEffect(() => {
    if (!isOpen) return;
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const type = apartmentId ? "APARTMENT" : "MANAGER_DASHBOARD";

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/30 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Chiudi assistente IA"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />

      <aside className="relative flex h-full w-full max-w-xl flex-col border-l border-white/50 bg-white shadow-2xl shadow-slate-950/20 sm:rounded-l-[2rem]">
        <div className="border-b border-slate-100 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-slate-900">
                <Sparkles size={20} className="text-violet-600" />
                AI Assistant
              </h2>
              <p className="mt-1 text-sm leading-5 text-slate-500">
                Chiedi informazioni, proponi modifiche a prenotazioni, pulizie e manutenzioni
              </p>
              {apartmentName && (
                <p className="mt-3 rounded-full bg-violet-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-violet-700">
                  Contesto: {apartmentName}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-lg font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
              aria-label="Chiudi"
            >
              ×
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <AIAssistant
            role="MANAGER"
            type={type}
            apartmentId={apartmentId}
          />
        </div>
      </aside>
    </div>
  );
}

type ManagerAIChatLauncherProps = {
  apartmentId?: string;
  apartmentName?: string;
  compact?: boolean;
};

export function ManagerAIChatLauncher({ apartmentId, apartmentName, compact }: ManagerAIChatLauncherProps = {}) {
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsAIChatOpen(true)}
        className={
          compact
            ? "flex items-center gap-2 rounded-full border border-violet-200 bg-white px-4 h-12 shadow-sm text-xs font-bold uppercase tracking-widest text-violet-700 transition hover:bg-violet-50 hover:shadow-md whitespace-nowrap"
            : "mt-5 flex w-full max-w-sm items-center justify-center gap-2 rounded-2xl border border-violet-100 bg-white/70 px-5 py-3 text-xs font-bold uppercase tracking-widest text-violet-700 shadow-sm shadow-violet-500/5 transition hover:-translate-y-0.5 hover:bg-violet-50 hover:shadow-md"
        }
      >
        <Sparkles size={16} />
        AI Assistant
      </button>

      <ManagerAIChat
        apartmentId={apartmentId}
        apartmentName={apartmentName}
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
      />
    </>
  );
}
