"use client";

import { useState, useRef } from "react";
import { upload } from "@vercel/blob/client";
import { addMaintenanceNote } from "@/src/app/actions/maintenance-token";
import type { MaintenanceNote } from "@/src/app/actions/maintenance-token";
import { Camera, Loader2, Send, X } from "lucide-react";

interface Props {
  ticketId: string;
  authorName: string | null;
  initialNotes: MaintenanceNote[];
  isDone: boolean;
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  const time = d.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
  if (isToday) return `Oggi ${time}`;
  return d.toLocaleDateString("it-IT", { day: "numeric", month: "short" }) + ` · ${time}`;
}

export default function MaintenanceNoteForm({ ticketId, authorName, initialNotes, isDone }: Props) {
  const [notes, setNotes]           = useState<MaintenanceNote[]>(initialNotes);
  const [text, setText]             = useState("");
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [previews, setPreviews]     = useState<string[]>([]);
  const [sending, setSending]       = useState(false);
  const [justSent, setJustSent]     = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const canSend = (text.trim().length > 0 || photoFiles.length > 0) && !sending;

  function addPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setPhotoFiles((prev) => [...prev, ...files]);
    setPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    if (fileRef.current) fileRef.current.value = "";
  }

  function removePhoto(idx: number) {
    setPhotoFiles((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSend() {
    if (!canSend) return;
    setSending(true);
    setError(null);

    try {
      // Upload tutte le foto
      const uploadedUrls: string[] = [];
      for (const file of photoFiles) {
        const blob = await upload(
          `uploads/maintenance/${ticketId}/notes/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`,
          file,
          { access: "public", handleUploadUrl: "/api/blob-upload" }
        );
        uploadedUrls.push(blob.url);
      }

      const newNote = await addMaintenanceNote(ticketId, text, uploadedUrls, authorName);
      setNotes((prev) => [...prev, newNote]);
      setText("");
      setPhotoFiles([]);
      setPreviews([]);
      setJustSent(true);
      setTimeout(() => setJustSent(false), 3000);
    } catch {
      setError("Errore durante l'invio. Riprova.");
    } finally {
      setSending(false);
    }
  }

  // Ticket completato e nessuna nota → nascondi tutto
  if (isDone && notes.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-start gap-3 px-4 py-3 border-b border-slate-100">
        <span className="text-base mt-0.5">📝</span>
        <div>
          <p className="text-sm font-bold text-slate-800">
            {isDone ? "Note inviate" : "Note al manager"}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {isDone
              ? "Riepilogo comunicazioni con il manager"
              : "Segnala problemi, materiali mancanti o info extra"}
          </p>
        </div>
      </div>

      <div className="px-4 py-3 flex flex-col gap-3">

        {/* Conferma invio */}
        {justSent && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5 animate-in fade-in slide-in-from-top-2 duration-300">
            <span className="text-base">✅</span>
            <span className="text-xs font-bold text-emerald-700">Nota inviata al manager!</span>
          </div>
        )}

        {/* Storico note */}
        {notes.length > 0 && (
          <div className="flex flex-col gap-2">
            {notes.length > 0 && !isDone && (
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                Note inviate
              </p>
            )}
            {notes.map((note) => (
              <div key={note.id} className="bg-orange-50 border border-orange-100 rounded-xl px-3 py-2.5">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-black text-orange-600">
                    👷 {note.authorName ?? "Manutentore"}
                  </span>
                  <span className="text-[9px] text-slate-400 font-semibold">
                    {formatTime(note.createdAt)}
                  </span>
                </div>
                {note.text && (
                  <p className="text-xs text-slate-700 leading-relaxed">{note.text}</p>
                )}
                {note.photoUrls.length > 0 && (
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {note.photoUrls.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noreferrer">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt={`foto ${i + 1}`}
                          className="w-12 h-12 rounded-lg object-cover border border-orange-200 hover:scale-105 transition-transform"
                        />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Form — nascosto se ticket completato */}
        {!isDone && (
          <>
            {/* Textarea */}
            <div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, 500))}
                placeholder="Scrivi una nota per il manager…"
                rows={3}
                className={`w-full border rounded-xl px-3 py-2.5 text-sm text-slate-800 font-normal resize-none outline-none transition-colors bg-slate-50 ${
                  text.length > 0
                    ? "border-orange-300 bg-white"
                    : "border-slate-200"
                }`}
              />
              <p className={`text-right text-[9px] font-bold mt-0.5 ${text.length > 0 ? "text-orange-500" : "text-slate-300"}`}>
                {text.length} / 500
              </p>
            </div>

            {/* Foto strip */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Aggiungi foto */}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-14 h-14 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-0.5 hover:border-orange-300 hover:bg-orange-50 transition-colors flex-shrink-0"
              >
                <Camera size={16} className="text-slate-400" />
                <span className="text-[8px] font-700 text-slate-400 uppercase tracking-wide">Foto</span>
              </button>

              {/* Preview foto selezionate */}
              {previews.map((src, idx) => (
                <div key={idx} className="relative w-14 h-14 flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`foto ${idx + 1}`}
                    className="w-14 h-14 object-cover rounded-xl border border-slate-200"
                  />
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
              onChange={addPhoto}
            />

            {/* Errore */}
            {error && (
              <p className="text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
                ⚠️ {error}
              </p>
            )}

            {/* Bottone invia */}
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
                  {photoFiles.length > 0
                    ? `Invia nota${text.trim() ? "" : " "} + ${photoFiles.length} foto`
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
