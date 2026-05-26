"use client";

import { useState, useRef } from "react";
import { upload } from "@vercel/blob/client";
import { sendMaintenancePublicNote } from "@/src/app/actions/maintenance-token";
import type { MaintenancePublicMessage } from "@/src/app/actions/maintenance-token";
import { Camera, Send, X, Loader2 } from "lucide-react";

interface Props {
  ticketId: string;
  authorName: string | null;
  initialMessages: MaintenancePublicMessage[];
  isDone: boolean;
  title?: string;
}

function formatTime(date: Date) {
  const d = new Date(date);
  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  const time = d.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
  return isToday ? `Oggi ${time}` : d.toLocaleDateString("it-IT", { day: "numeric", month: "short" }) + ` · ${time}`;
}

export default function MaintenanceNoteForm({ ticketId, authorName, initialMessages, isDone, title }: Props) {
  const [messages, setMessages] = useState<MaintenancePublicMessage[]>(initialMessages);
  const [text, setText]         = useState("");
  const [photos, setPhotos]     = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [sending, setSending]   = useState(false);
  const [justSent, setJustSent] = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const canSend = (text.trim().length > 0 || photos.length > 0) && !sending;

  function addPhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setPhotos((p) => [...p, ...files]);
    setPreviews((p) => [...p, ...files.map((f) => URL.createObjectURL(f))]);
    if (fileRef.current) fileRef.current.value = "";
  }

  function removePhoto(idx: number) {
    setPhotos((p) => p.filter((_, i) => i !== idx));
    setPreviews((p) => p.filter((_, i) => i !== idx));
  }

  async function handleSend() {
    if (!canSend) return;
    setSending(true);
    setError(null);

    try {
      const newMessages: MaintenancePublicMessage[] = [];

      if (photos.length === 0) {
        // Solo testo
        const msg = await sendMaintenancePublicNote(ticketId, text, null, authorName);
        newMessages.push(msg);
      } else {
        // Prima foto (con testo), poi foto extra (senza testo)
        for (let i = 0; i < photos.length; i++) {
          const blob = await upload(
            `uploads/maintenance/${ticketId}/notes/${Date.now()}-${photos[i].name.replace(/[^a-zA-Z0-9._-]/g, "_")}`,
            photos[i],
            { access: "public", handleUploadUrl: "/api/blob-upload" }
          );
          const msg = await sendMaintenancePublicNote(
            ticketId,
            i === 0 ? text : "",
            blob.url,
            authorName,
          );
          newMessages.push(msg);
        }
      }

      setMessages((prev) => [...prev, ...newMessages]);
      setText("");
      setPhotos([]);
      setPreviews([]);
      setJustSent(true);
      setTimeout(() => setJustSent(false), 3000);
    } catch {
      setError("Errore durante l'invio. Riprova.");
    } finally {
      setSending(false);
    }
  }

  // Ticket completato e nessun messaggio → nascondi
  if (isDone && messages.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-start gap-3 px-4 py-3 border-b border-slate-100">
        <span className="text-base mt-0.5">📝</span>
        <div>
          <p className="text-sm font-bold text-slate-800">
            {isDone ? "Note inviate" : (title ?? "Note al manager")}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {isDone
              ? "Riepilogo comunicazioni inviate"
              : "Segnala problemi, materiali mancanti o info extra"}
          </p>
        </div>
      </div>

      <div className="px-4 py-3 flex flex-col gap-3">

        {/* Banner conferma */}
        {justSent && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5 animate-in fade-in slide-in-from-top-2 duration-300">
            <span>✅</span>
            <span className="text-xs font-bold text-emerald-700">Nota inviata al manager!</span>
          </div>
        )}

        {/* Storico messaggi */}
        {messages.length > 0 && (
          <div className="flex flex-col gap-2">
            {!isDone && (
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Note inviate</p>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className="bg-orange-50 border border-orange-100 rounded-xl px-3 py-2.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-black text-orange-600">
                    👷 {msg.senderName}
                  </span>
                  <span className="text-[9px] text-slate-400 font-semibold">
                    {formatTime(msg.createdAt)}
                  </span>
                </div>
                {msg.text && (
                  <p className="text-xs text-slate-700 leading-relaxed">{msg.text}</p>
                )}
                {msg.attachment && (
                  <div className="mt-2">
                    <a href={msg.attachment.url} target="_blank" rel="noreferrer">
                      {msg.attachment.fileType?.startsWith("image/") || msg.attachment.url.match(/\.(jpg|jpeg|png|webp|gif)$/i) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={msg.attachment.url}
                          alt={msg.attachment.fileName}
                          className="w-24 h-24 object-cover rounded-lg border border-orange-200 hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="flex items-center gap-2 bg-white border border-orange-200 rounded-lg px-3 py-2">
                          <span>📄</span>
                          <span className="text-xs text-slate-600 truncate">{msg.attachment.fileName}</span>
                        </div>
                      )}
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Form — solo se non completato */}
        {!isDone && (
          <>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, 500))}
              placeholder="Scrivi una nota per il manager…"
              rows={3}
              className={`w-full border rounded-xl px-3 py-2.5 text-sm text-slate-800 resize-none outline-none transition-colors bg-slate-50 ${
                text.length > 0 ? "border-orange-300 bg-white" : "border-slate-200"
              }`}
            />
            <p className={`text-right text-[9px] font-bold -mt-1 ${text.length > 0 ? "text-orange-500" : "text-slate-300"}`}>
              {text.length} / 500
            </p>

            {/* Strip foto */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-14 h-14 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-0.5 hover:border-orange-300 hover:bg-orange-50 transition-colors flex-shrink-0"
              >
                <Camera size={16} className="text-slate-400" />
                <span className="text-[8px] font-bold text-slate-400 uppercase">Foto</span>
              </button>
              {previews.map((src, idx) => (
                <div key={idx} className="relative w-14 h-14 flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="w-14 h-14 object-cover rounded-xl border border-slate-200" />
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-slate-800 text-white flex items-center justify-center"
                  >
                    <X size={9} />
                  </button>
                </div>
              ))}
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              className="hidden"
              onChange={addPhotos}
            />

            {error && (
              <p className="text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
                ⚠️ {error}
              </p>
            )}

            <button
              type="button"
              onClick={handleSend}
              disabled={!canSend}
              className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-colors ${
                canSend
                  ? "bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-200"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
              }`}
            >
              {sending ? (
                <><Loader2 size={15} className="animate-spin" /> Invio in corso...</>
              ) : (
                <>
                  <Send size={15} />
                  {photos.length > 0
                    ? `Invia nota${text.trim() ? "" : " "} + ${photos.length} foto`
                    : "Invia nota"}
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
