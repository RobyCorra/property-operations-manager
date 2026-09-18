"use client";

import { useRef, useState, useTransition } from "react";
import type { ChatMsg } from "@/src/app/actions/company";

type SendResult = { success: boolean; error?: string };

export default function ImpresaChatThread({
  messages,
  headerName,
  onSend,
  onSent,
  loading,
}: {
  messages: ChatMsg[];
  headerName?: string;
  onSend: (fd: FormData) => Promise<SendResult>;
  onSent: () => void;
  loading?: boolean;
}) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, startBusy] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);

  // Registrazione vocale
  const [recording, setRecording] = useState(false);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const submit = (fd: FormData) => {
    setError(null);
    startBusy(async () => {
      const r = await onSend(fd);
      if (!r.success) setError(r.error || "Errore invio.");
      else { setText(""); onSent(); }
    });
  };

  const sendText = () => {
    if (!text.trim()) return;
    const fd = new FormData();
    fd.set("text", text.trim());
    submit(fd);
  };

  const sendFile = (file: File) => {
    if (!file) return;
    const fd = new FormData();
    if (text.trim()) fd.set("text", text.trim());
    fd.set("file", file);
    submit(fd);
  };

  const startRec = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = ["audio/webm", "audio/mp4", "audio/ogg"].find((m) => (window as any).MediaRecorder?.isTypeSupported?.(m)) || "";
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunksRef.current = [];
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const type = rec.mimeType || "audio/webm";
        const ext = type.includes("mp4") ? "m4a" : type.includes("ogg") ? "ogg" : "webm";
        const blob = new Blob(chunksRef.current, { type });
        if (blob.size > 0) sendFile(new File([blob], `vocale.${ext}`, { type }));
      };
      recRef.current = rec;
      rec.start();
      setRecording(true);
    } catch {
      setError("Microfono non disponibile.");
    }
  };
  const stopRec = () => { recRef.current?.stop(); setRecording(false); };

  return (
    <div className="flex min-h-[420px] flex-col rounded-2xl border border-gray-100 bg-white shadow-sm">
      {headerName && <div className="border-b border-gray-100 px-4 py-3 text-sm font-semibold text-slate-900">{headerName}</div>}
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {loading && <p className="text-xs text-gray-400">Carico…</p>}
        {!loading && messages.length === 0 && <p className="text-xs text-gray-400">Nessun messaggio.</p>}
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.mine ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm ${m.mine ? "bg-violet-500 text-white" : "bg-gray-100 text-slate-800"}`}>
              {m.mediaUrl && m.mediaType === "image" && (
                <a href={m.mediaUrl} target="_blank" rel="noreferrer">
                  <img src={m.mediaUrl} alt={m.mediaName ?? "foto"} className="mb-1 max-h-56 rounded-lg" />
                </a>
              )}
              {m.mediaUrl && m.mediaType === "audio" && (
                <audio controls src={m.mediaUrl} className="mb-1 w-52 max-w-full" />
              )}
              {m.mediaUrl && m.mediaType === "file" && (
                <a href={m.mediaUrl} target="_blank" rel="noreferrer" className={`mb-1 flex items-center gap-1 underline ${m.mine ? "text-white" : "text-violet-600"}`}>
                  📎 {m.mediaName ?? "allegato"}
                </a>
              )}
              {m.text && <div>{m.text}</div>}
              <div className={`mt-0.5 text-[10px] ${m.mine ? "text-violet-100" : "text-gray-400"}`}>
                {new Date(m.createdAt).toLocaleString("it-IT", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {error && <p className="px-4 pb-1 text-xs text-red-500">{error}</p>}

      <div className="flex items-center gap-1.5 border-t border-gray-100 p-2.5">
        <input ref={photoRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => e.target.files?.[0] && sendFile(e.target.files[0])} />
        <input ref={fileRef} type="file" hidden onChange={(e) => e.target.files?.[0] && sendFile(e.target.files[0])} />
        <button type="button" onClick={() => photoRef.current?.click()} disabled={busy} title="Foto" className="flex h-9 w-9 items-center justify-center rounded-full text-lg hover:bg-gray-100 disabled:opacity-40">📷</button>
        <button type="button" onClick={() => fileRef.current?.click()} disabled={busy} title="Allegato" className="flex h-9 w-9 items-center justify-center rounded-full text-lg hover:bg-gray-100 disabled:opacity-40">📎</button>
        {recording ? (
          <button type="button" onClick={stopRec} title="Ferma e invia" className="flex h-9 items-center gap-1 rounded-full bg-rose-500 px-3 text-xs font-semibold text-white">
            <span className="h-2 w-2 animate-pulse rounded-full bg-white" /> Stop
          </button>
        ) : (
          <button type="button" onClick={startRec} disabled={busy} title="Vocale" className="flex h-9 w-9 items-center justify-center rounded-full text-lg hover:bg-gray-100 disabled:opacity-40">🎤</button>
        )}
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendText()}
          placeholder="Scrivi un messaggio…"
          className="flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
        />
        <button type="button" onClick={sendText} disabled={busy || !text.trim()} className="rounded-full bg-gradient-to-r from-violet-500 to-blue-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">
          Invia
        </button>
      </div>
    </div>
  );
}
