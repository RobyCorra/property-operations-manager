"use client";

import { useState, useRef, useEffect } from "react";
import { upload } from "@vercel/blob/client";
import { sendMaintenancePublicNote, fetchMaintenanceMessages } from "@/src/app/actions/maintenance-token";
import type { MaintenancePublicMessage } from "@/src/app/actions/maintenance-token";
import { playNotificationSound, setupNotificationAudio } from "@/src/lib/notification-sound";
import { compressImage } from "@/src/lib/compress-image";
import { startVoiceRecording, MicPermissionError, type VoiceRecorderHandle } from "@/src/lib/voice-recorder";
import { Camera, Send, X, Loader2, Mic, Square, Play, Pause, Trash2 } from "lucide-react";

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

function formatDuration(secs: number) {
  const m = Math.floor(secs / 60).toString().padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function isAudio(fileType?: string | null, url?: string) {
  return fileType?.startsWith("audio/") || url?.match(/\.(webm|mp4|ogg|m4a|aac|wav|mp3)$/i);
}

function isImage(fileType?: string | null, url?: string) {
  return fileType?.startsWith("image/") || url?.match(/\.(jpg|jpeg|png|webp|gif)$/i);
}

export default function MaintenanceNoteForm({ ticketId, authorName, initialMessages, isDone, title }: Props) {
  const [messages, setMessages]       = useState<MaintenancePublicMessage[]>(initialMessages);
  const [text, setText]               = useState("");
  const [photos, setPhotos]           = useState<File[]>([]);
  const [previews, setPreviews]       = useState<string[]>([]);
  const [sending, setSending]         = useState(false);
  const [justSent, setJustSent]       = useState(false);
  const [error, setError]             = useState<string | null>(null);

  // Registrazione vocale
  const [isRecording, setIsRecording]       = useState(false);
  const [recordingSeconds, setRecordingSec] = useState(0);
  const [audioBlob, setAudioBlob]           = useState<Blob | null>(null);
  const [audioPreviewUrl, setAudioPreview]  = useState<string | null>(null);
  const [sendingVoice, setSendingVoice]     = useState(false);

  const fileRef          = useRef<HTMLInputElement>(null);
  const recHandleRef     = useRef<VoiceRecorderHandle | null>(null);
  const recExtRef        = useRef<string>("m4a");
  const timerRef         = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef          = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastMessageAt    = useRef<Date>(
    initialMessages.length > 0
      ? new Date(initialMessages[initialMessages.length - 1].createdAt)
      : new Date()
  );

  // Polling intelligente con Page Visibility API
  useEffect(() => {
    if (isDone) return; // nessun polling se ticket chiuso

    async function poll() {
      try {
        const newMsgs = await fetchMaintenanceMessages(ticketId, lastMessageAt.current);
        if (newMsgs.length > 0) {
          lastMessageAt.current = new Date(newMsgs[newMsgs.length - 1].createdAt);
          // Suona solo se almeno un messaggio viene dal manager (non dal manutentore stesso)
          const hasManagerMsg = newMsgs.some(m => m.role === "MANAGER");
          if (hasManagerMsg) playNotificationSound();
          setMessages(prev => {
            const existingIds = new Set(prev.map(m => m.id));
            return [...prev, ...newMsgs.filter(m => !existingIds.has(m.id))];
          });
        }
      } catch {
        // polling silenzioso — nessun errore mostrato all'utente
      }
    }

    const INTERVAL = 8000;

    function startPoll() {
      poll(); // fetch immediato al ritorno in foreground
      pollRef.current = setInterval(poll, INTERVAL);
    }

    function stopPoll() {
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    }

    function onVisibilityChange() {
      if (document.visibilityState === "visible") startPoll();
      else stopPoll();
    }

    startPoll();
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      stopPoll();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [ticketId, isDone]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sblocca AudioContext al primo gesto utente sulla pagina
  useEffect(() => { setupNotificationAudio(); }, []);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      recHandleRef.current?.cancel();
      if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
    };
  }, [audioPreviewUrl]);

  const canSend = (text.trim().length > 0 || photos.length > 0) && !sending && !isRecording && !audioBlob;

  /* ── Foto ── */
  function addPhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setPhotos(p => [...p, ...files]);
    setPreviews(p => [...p, ...files.map(f => URL.createObjectURL(f))]);
    if (fileRef.current) fileRef.current.value = "";
  }

  function removePhoto(idx: number) {
    setPhotos(p => p.filter((_, i) => i !== idx));
    setPreviews(p => p.filter((_, i) => i !== idx));
  }

  /* ── Registrazione ── */
  // Registrazione: su app nativa usa il plugin AAC (cross-platform), nel browser
  // desktop usa MediaRecorder. Vedi src/lib/voice-recorder.ts.
  async function startRecording() {
    setError(null);
    try {
      const handle = await startVoiceRecording();
      recHandleRef.current = handle;
      setIsRecording(true);
      setRecordingSec(0);
      timerRef.current = setInterval(() => setRecordingSec(s => s + 1), 1000);
    } catch (e) {
      if (e instanceof MicPermissionError) {
        setError("Permesso microfono negato. Abilitalo nelle impostazioni del dispositivo per PropOps.");
      } else {
        setError(e instanceof Error ? e.message : "Microfono non accessibile. Verifica il permesso del microfono.");
      }
    }
  }

  async function stopRecording() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setIsRecording(false);
    const handle = recHandleRef.current;
    if (!handle) return;
    recHandleRef.current = null;
    try {
      const rec = await handle.stop();
      recExtRef.current = rec.ext;
      setAudioBlob(rec.blob);
      setAudioPreview(rec.url);
    } catch {
      setError("Errore durante la registrazione. Riprova.");
    }
  }

  function discardAudio() {
    if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
    setAudioBlob(null);
    setAudioPreview(null);
    setRecordingSec(0);
  }

  async function sendVoice() {
    if (!audioBlob) return;
    setSendingVoice(true);
    setError(null);
    try {
      const ext      = recExtRef.current || "m4a";
      const fileName = `vocale-${Date.now()}.${ext}`;
      const file     = new File([audioBlob], fileName, { type: audioBlob.type });
      const blob     = await upload(
        `uploads/maintenance/${ticketId}/notes/${fileName}`,
        file,
        { access: "public", handleUploadUrl: "/api/blob-upload" }
      );
      const msg = await sendMaintenancePublicNote(ticketId, "", blob.url, authorName, {
        fileName,
        fileType: audioBlob.type,
      });
      setMessages(prev => [...prev, msg]);
      discardAudio();
      setJustSent(true);
      setTimeout(() => setJustSent(false), 3000);
    } catch {
      setError("Errore durante l'invio del vocale. Riprova.");
    } finally {
      setSendingVoice(false);
    }
  }

  /* ── Invio testo/foto ── */
  async function handleSend() {
    if (!canSend) return;
    setSending(true);
    setError(null);
    try {
      const newMessages: MaintenancePublicMessage[] = [];
      if (photos.length === 0) {
        const msg = await sendMaintenancePublicNote(ticketId, text, null, authorName);
        newMessages.push(msg);
      } else {
        for (let i = 0; i < photos.length; i++) {
          const compressed = await compressImage(photos[i]);
          const blob = await upload(
            `uploads/maintenance/${ticketId}/notes/${Date.now()}-${compressed.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`,
            compressed,
            { access: "public", handleUploadUrl: "/api/blob-upload" }
          );
          const msg = await sendMaintenancePublicNote(
            ticketId,
            i === 0 ? text : "",
            blob.url,
            authorName,
            { fileName: photos[i].name, fileType: photos[i].type },
          );
          newMessages.push(msg);
        }
      }
      setMessages(prev => [...prev, ...newMessages]);
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
            <span className="text-xs font-bold text-emerald-700">Messaggio inviato!</span>
          </div>
        )}

        {/* Storico messaggi */}
        {messages.length > 0 && (
          <div className="flex flex-col gap-2">
            {!isDone && (
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Messaggi</p>
            )}
            {messages.map((msg) => {
              const isManager = msg.role === "MANAGER";
              return (
                <div key={msg.id} className={`flex flex-col gap-1 ${isManager ? "items-end" : "items-start"}`}>
                  <div className={`max-w-[85%] rounded-xl px-3 py-2.5 ${
                    isManager ? "bg-slate-100 border border-slate-200" : "bg-orange-50 border border-orange-100"
                  }`}>
                    <div className={`flex items-center gap-2 mb-1.5 ${isManager ? "flex-row-reverse" : ""}`}>
                      <span className={`text-[10px] font-black ${isManager ? "text-slate-600" : "text-orange-600"}`}>
                        {isManager ? `💼 ${msg.senderName}` : `👷 ${msg.senderName}`}
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
                        {isAudio(msg.attachment.fileType, msg.attachment.url) ? (
                          /* Player vocale */
                          <div className={`flex items-center gap-2 rounded-xl px-3 py-2 ${
                            isManager ? "bg-white border border-slate-200" : "bg-white border border-orange-200"
                          }`}>
                            <Mic size={14} className={isManager ? "text-slate-500 shrink-0" : "text-orange-500 shrink-0"} />
                            <audio
                              controls
                              src={msg.attachment.url}
                              className="h-8 w-full max-w-[200px]"
                            />
                          </div>
                        ) : isImage(msg.attachment.fileType, msg.attachment.url) ? (
                          <a href={msg.attachment.url} target="_blank" rel="noreferrer">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={msg.attachment.url}
                              alt={msg.attachment.fileName}
                              className={`w-24 h-24 object-cover rounded-lg hover:scale-105 transition-transform ${
                                isManager ? "border border-slate-200" : "border border-orange-200"
                              }`}
                            />
                          </a>
                        ) : (
                          <a href={msg.attachment.url} target="_blank" rel="noreferrer">
                            <div className={`flex items-center gap-2 bg-white rounded-lg px-3 py-2 ${
                              isManager ? "border border-slate-200" : "border border-orange-200"
                            }`}>
                              <span>📄</span>
                              <span className="text-xs text-slate-600 truncate">{msg.attachment.fileName}</span>
                            </div>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Form — solo se non completato */}
        {!isDone && (
          <>
            {/* Textarea — nascosta durante registrazione/preview vocale */}
            {!isRecording && !audioBlob && (
              <>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value.slice(0, 500))}
                  placeholder="Scrivi un messaggio…"
                  rows={3}
                  className={`w-full border rounded-xl px-3 py-2.5 text-sm text-slate-800 resize-none outline-none transition-colors bg-slate-50 ${
                    text.length > 0 ? "border-orange-300 bg-white" : "border-slate-200"
                  }`}
                />
                <p className={`text-right text-[9px] font-bold -mt-1 ${text.length > 0 ? "text-orange-500" : "text-slate-300"}`}>
                  {text.length} / 500
                </p>
              </>
            )}

            {/* Stato: durante registrazione */}
            {isRecording && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shrink-0" />
                <span className="text-sm font-bold text-red-700 flex-1">
                  {formatDuration(recordingSeconds)}
                </span>
                <button
                  type="button"
                  onClick={stopRecording}
                  className="flex items-center gap-1.5 bg-red-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Square size={11} /> Stop
                </button>
              </div>
            )}

            {/* Stato: anteprima vocale registrato */}
            {audioBlob && !isRecording && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Mic size={14} className="text-orange-500 shrink-0" />
                  <span className="text-xs font-bold text-orange-700 flex-1">
                    Vocale · {formatDuration(recordingSeconds)}
                  </span>
                </div>
                <audio controls src={audioPreviewUrl ?? undefined} className="w-full h-8" />
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={discardAudio}
                    disabled={sendingVoice}
                    className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={11} /> Scarta
                  </button>
                  <button
                    type="button"
                    onClick={sendVoice}
                    disabled={sendingVoice}
                    className="flex-1 flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-3 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-colors disabled:opacity-70"
                  >
                    {sendingVoice
                      ? <><Loader2 size={11} className="animate-spin" /> Invio...</>
                      : <><Send size={11} /> Invia vocale</>
                    }
                  </button>
                </div>
              </div>
            )}

            {/* Strip foto + pulsante mic */}
            {!isRecording && !audioBlob && (
              <div className="flex items-center gap-2 flex-wrap">
                {/* Foto */}
                <button
                  type="button"
                  onClick={() => { fileRef.current?.click(); }}
                  className="w-14 h-14 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-0.5 hover:border-orange-300 hover:bg-orange-50 transition-colors flex-shrink-0"
                >
                  <Camera size={16} className="text-slate-400" />
                  <span className="text-[8px] font-bold text-slate-400 uppercase">Foto</span>
                </button>
                {/* Microfono */}
                <button
                  type="button"
                  onClick={() => { startRecording(); }}
                  className="w-14 h-14 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-0.5 hover:border-red-300 hover:bg-red-50 transition-colors flex-shrink-0"
                >
                  <Mic size={16} className="text-slate-400" />
                  <span className="text-[8px] font-bold text-slate-400 uppercase">Voce</span>
                </button>
                {/* Anteprime foto */}
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
            )}

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

            {/* Bottone invia testo/foto */}
            {!isRecording && !audioBlob && (
              <button
                type="button"
                onClick={() => { handleSend(); }}
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
                    {photos.length > 0 ? `Invia + ${photos.length} foto` : "Invia"}
                  </>
                )}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
