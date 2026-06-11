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

  const type = apartmentId ? "APARTMENT" : "MANAGER_DASHBOARD";

  return (
    <AIAssistant
      role="MANAGER"
      type={type}
      apartmentId={apartmentId}
      open={isOpen}
      onClose={onClose}
      contextLabel={apartmentName ? `Contesto: ${apartmentName}` : undefined}
    />
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
