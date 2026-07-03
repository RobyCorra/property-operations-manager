"use client";

import { useState, useRef, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import { updateCheckinChecklist, updateCheckinStatus, createCheckinTaskMessage } from "@/src/app/actions/checkin";
import TicketConversation from "@/src/components/ticket-conversation";

interface ChecklistItem {
  id: string;
  label: string;
  required: boolean;
  photoRequired: boolean;
  completed: boolean;
  photoUrl?: string | null;
}

interface Props {
  taskId: string;
  apartmentName: string;
  apartmentAddress: string;
  mapsUrl: string;
  dateLabel: string;
  guestName: string | null;
  initialItems: ChecklistItem[];
  readOnly: boolean;
  initialMessages: any[];
  currentUserName: string;
}

export default function CheckinTaskView({
  taskId,
  apartmentName,
  apartmentAddress,
  mapsUrl,
  dateLabel,
  guestName,
  initialItems,
  readOnly,
  initialMessages,
  currentUserName,
}: Props) {
  const router = useRouter();
  const [items, setItems] = useState<ChecklistItem[]>(initialItems);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  // Polling messaggi chat (ogni 5s) + al ritorno in foreground.
  useEffect(() => {
    const iv = setInterval(() => router.refresh(), 5000);
    const onVis = () => { if (document.visibilityState === "visible") router.refresh(); };
    document.addEventListener("visibilitychange", onVis);
    return () => { clearInterval(iv); document.removeEventListener("visibilitychange", onVis); };
  }, [router]);

  const persist = (id: string, patch: Partial<ChecklistItem>) => {
    updateCheckinChecklist(taskId, [{ id, completed: patch.completed, photoUrl: patch.photoUrl }]).catch(() => {});
  };

  const toggle = (item: ChecklistItem) => {
    if (readOnly) return;
    // Le voci con foto obbligatoria si completano scattando la foto, non con la spunta.
    if (item.photoRequired && !item.photoUrl) {
      fileInputs.current[item.id]?.click();
      return;
    }
    const completed = !item.completed;
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, completed } : i)));
    persist(item.id, { completed });
  };

  const onPhoto = async (item: ChecklistItem, file: File | undefined) => {
    if (!file || readOnly) return;
    setUploadingId(item.id);
    try {
      const result = await upload(
        `uploads/checkin/${taskId}/${item.id}/${Date.now()}-${file.name}`,
        file,
        { access: "public", handleUploadUrl: "/api/blob-upload" }
      );
      const photoUrl = result.url;
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, photoUrl, completed: true } : i)));
      persist(item.id, { photoUrl, completed: true });
    } catch (err: unknown) {
      alert((err as Error).message || "Errore durante il caricamento della foto.");
    } finally {
      setUploadingId(null);
    }
  };

  const blocking = items.filter(
    (i) => (i.required && !i.completed) || (i.photoRequired && !i.photoUrl)
  );
  const canComplete = blocking.length === 0;

  const complete = () => {
    startTransition(async () => {
      try {
        await updateCheckinStatus(taskId, "COMPLETED");
        router.push("/dashboard/checkin");
      } catch (err: unknown) {
        alert((err as Error).message || "Errore durante il completamento.");
      }
    });
  };

  return (
    <div className="max-w-lg mx-auto px-5 py-5 space-y-5">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5">
        <p className="text-lg font-semibold text-slate-900">{apartmentName}</p>
        <p className="text-sm text-slate-500">{dateLabel}</p>
        {guestName && <p className="text-sm text-slate-500">Ospite: {guestName}</p>}
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-3 text-xs font-bold text-blue-600"
        >
          📍 {apartmentAddress}
        </a>
      </div>

      {/* Checklist */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">
          Checklist check-in
        </p>
        <div className="space-y-1">
          {items.length === 0 && (
            <p className="text-sm text-slate-400 py-4">Nessuna voce configurata per questo appartamento.</p>
          )}
          {items.map((item) => (
            <div key={item.id} className="py-2.5 border-b border-slate-50 last:border-0">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => toggle(item)}
                  disabled={readOnly}
                  className="flex items-center gap-3 text-left flex-1 min-w-0 disabled:opacity-70"
                >
                  <span
                    className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 ${
                      item.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300"
                    }`}
                  >
                    {item.completed && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </span>
                  <span className={`text-sm ${item.completed ? "text-slate-400 line-through" : "text-slate-800"}`}>
                    {item.label}
                  </span>
                </button>
                <div className="flex items-center gap-2 shrink-0">
                  {item.required && (
                    <span className="text-[9px] font-black uppercase tracking-wider text-amber-600">obblig.</span>
                  )}
                  {item.photoRequired && !readOnly && (
                    <button
                      type="button"
                      onClick={() => fileInputs.current[item.id]?.click()}
                      className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded ${
                        item.photoUrl
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-blue-50 text-blue-600 border border-blue-200"
                      }`}
                    >
                      {uploadingId === item.id ? "..." : item.photoUrl ? "📷 ok" : "📷 foto"}
                    </button>
                  )}
                </div>
              </div>

              {item.photoRequired && (
                <input
                  ref={(el) => { fileInputs.current[item.id] = el; }}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => onPhoto(item, e.target.files?.[0])}
                />
              )}
              {item.photoUrl && (
                <img
                  src={item.photoUrl}
                  alt="foto check-in"
                  className="mt-2 ml-9 w-24 h-24 object-cover rounded-lg border border-slate-200"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Completa */}
      {!readOnly && (
        <button
          type="button"
          onClick={complete}
          disabled={isPending || !canComplete}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-xs font-black uppercase tracking-widest shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isPending
            ? "..."
            : canComplete
            ? "Completa check-in"
            : "Completa voci e foto obbligatorie"}
        </button>
      )}
      {readOnly && (
        <p className="text-center text-xs font-bold text-emerald-600 uppercase tracking-widest">
          Check-in completato
        </p>
      )}

      {/* Chat con il Manager */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <p className="font-semibold text-slate-800 text-sm">💬 Chat con il Manager</p>
        </div>
        <div className="p-3">
          <TicketConversation
            entityId={taskId}
            initialMessages={initialMessages}
            currentUserRole="CHECKIN"
            currentUserName={currentUserName}
            submitAction={createCheckinTaskMessage}
          />
        </div>
      </div>
    </div>
  );
}
