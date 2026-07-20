"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { getAllQueued, deleteFromQueue } from "@/src/lib/photo-queue-db";
import { attachChecklistPhoto } from "@/src/app/actions/checklist";
import { useOnlineStatus } from "@/src/lib/use-online-status";

/**
 * Svuota la coda foto in sottofondo, indipendentemente dalla schermata aperta.
 *
 * La checklist ha un suo ciclo di invio, ma vive solo mentre la pulizia è in
 * corso: una foto rimasta indietro non partirebbe più una volta inviata o
 * approvata la pulizia. Questo componente resta montato su tutte le pagine del
 * cleaner e sulla vista pubblica, così le foto arrivano appena torna il segnale.
 */
const RETRY_MS = 15_000;

export default function PhotoQueueUploader() {
  const isOnline = useOnlineStatus();
  const [remaining, setRemaining] = useState(0);
  const busy = useRef(false);

  const drain = useCallback(async () => {
    if (busy.current || !navigator.onLine) return;
    busy.current = true;
    try {
      const entries = await getAllQueued();
      setRemaining(entries.length);
      for (const e of entries) {
        try {
          const file = new File([e.blob], e.filename, { type: e.blob.type });
          const result = await upload(
            `uploads/cleaning/${e.taskId}/checklist/${e.itemId}/${Date.now()}-${e.filename}`,
            file,
            { access: "public", handleUploadUrl: "/api/blob-upload" },
          );
          const res = await attachChecklistPhoto(e.taskId, e.itemId, result.url);
          // Se la voce non esiste più la foto non ha destinazione: evita di
          // riprovare all'infinito su una coda che non si svuoterà mai.
          if (res?.success || res?.error === "Voce non trovata.") {
            await deleteFromQueue(e.taskId, e.itemId);
          }
        } catch {
          // Rete ancora assente: riproveremo al prossimo giro
        }
      }
      setRemaining((await getAllQueued()).length);
    } finally {
      busy.current = false;
    }
  }, []);

  useEffect(() => {
    drain();
    const interval = setInterval(drain, RETRY_MS);
    return () => clearInterval(interval);
  }, [drain]);

  // Ritenta subito quando il segnale torna
  useEffect(() => {
    if (isOnline) drain();
  }, [isOnline, drain]);

  if (remaining === 0) return null;

  return (
    <div className="fixed bottom-3 right-3 z-[90] rounded-full bg-blue-600/90 px-3 py-1.5 text-[10px] font-bold text-white shadow-lg pointer-events-none">
      📸 {remaining} in invio
    </div>
  );
}
