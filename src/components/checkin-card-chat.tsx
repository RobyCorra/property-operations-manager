"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TicketConversation from "@/src/components/ticket-conversation";
import { createCheckinTaskMessage } from "@/src/app/actions/checkin";
import { useLang } from "@/src/components/lang-context";

interface Props {
  taskId: string;
  initialMessages: any[];
  currentUserName: string;
  hasUnread: boolean;
}

export default function CheckinCardChat({ taskId, initialMessages, currentUserName, hasUnread }: Props) {
  const router = useRouter();
  const { t } = useLang();
  const [open, setOpen] = useState(false);

  // Polling messaggi quando la chat è aperta.
  useEffect(() => {
    if (!open) return;
    const iv = setInterval(() => router.refresh(), 5000);
    const onVis = () => { if (document.visibilityState === "visible") router.refresh(); };
    document.addEventListener("visibilitychange", onVis);
    return () => { clearInterval(iv); document.removeEventListener("visibilitychange", onVis); };
  }, [open, router]);

  return (
    <div className="mt-3 border-t border-slate-100 pt-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between text-left"
      >
        <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          💬 {t.moChatManager}
          {hasUnread && <span className="w-2 h-2 rounded-full bg-rose-500" />}
        </span>
        <span className="text-xs text-slate-400">{open ? t.moClose : t.ckOpen}</span>
      </button>
      {open && (
        <div className="mt-3">
          <TicketConversation
            entityId={taskId}
            initialMessages={initialMessages}
            currentUserRole="CHECKIN"
            currentUserName={currentUserName}
            submitAction={createCheckinTaskMessage}
          />
        </div>
      )}
    </div>
  );
}
