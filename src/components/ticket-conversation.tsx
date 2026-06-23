"use client";

import { useTransition, useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SafeDate from "@/src/components/safe-date";
import { upload } from "@vercel/blob/client";
import { playNotificationSound, setupNotificationAudio } from "@/src/lib/notification-sound";
import { hapticMedium, hapticError } from "@/src/lib/haptics";
import { startVoiceRecording, MicPermissionError, type VoiceRecorderHandle } from "@/src/lib/voice-recorder";

interface Message {
  id: string;
  text: string | null;
  role: string;
  senderName: string;
  createdAt: Date;
  attachment?: {
    id: string;
    url: string;
    fileName: string;
    fileType: string | null;
  } | null;
}

interface Props {
  entityId: string;
  initialMessages: any[];
  currentUserRole: string;
  currentUserName: string;
  submitAction: (id: string, prevState: any, formData: FormData) => Promise<any>;
  heightClass?: string;
}

type RecordingState = "idle" | "recording" | "preview";

// Deterministic waveform bars from a string seed
function WaveformBars({ seed, color, dimColor, count = 20 }: { seed: string; color: string; dimColor: string; count?: number }) {
  const heights = Array.from({ length: count }, (_, i) => {
    const c = seed.charCodeAt(i % seed.length);
    return 3 + ((c * (i + 1) * 7) % 17);
  });
  return (
    <div className="flex items-center gap-[2px] flex-1 h-5">
      {heights.map((h, i) => (
        <div key={i} style={{ height: h, background: i < Math.floor(count * 0.4) ? color : dimColor, width: 3, borderRadius: 99, flexShrink: 0 }} />
      ))}
    </div>
  );
}

function formatDur(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export default function TicketConversation({
  entityId,
  initialMessages,
  currentUserRole,
  currentUserName,
  submitAction,
  heightClass = "h-[500px]",
}: Props) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [selectedFilePreview, setSelectedFilePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Voice recording
  const [recState, setRecState] = useState<RecordingState>("idle");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recSecs, setRecSecs] = useState(0);
  const [savedDuration, setSavedDuration] = useState(0);
  const recHandleRef = useRef<VoiceRecorderHandle | null>(null);
  const recExtRef = useRef<string>("m4a");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // bar animation for recording
  const [barHeights, setBarHeights] = useState<number[]>(Array(7).fill(4));
  const barTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const prevMsgCount = useRef(initialMessages.length);

  // ── Riproduzione vocali ─────────────────────────────────────────────────────
  // Usiamo un oggetto Audio in JS invece di un <audio display:none>: su iOS WebKit
  // gli elementi media nascosti (display:none) non si riproducono. new Audio().play()
  // dentro il gesto del click funziona in modo affidabile su iOS e Android.
  const [playingId, setPlayingId] = useState<string | null>(null);
  const playerRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = (id: string, url: string) => {
    const current = playerRef.current;
    // Stesso audio già in riproduzione → ferma
    if (current && playingId === id) {
      current.pause();
      current.currentTime = 0;
      setPlayingId(null);
      return;
    }
    // Ferma eventuale audio precedente
    if (current) { current.pause(); }
    const audio = new Audio(url);
    playerRef.current = audio;
    audio.onended = () => setPlayingId(null);
    audio.onerror = () => {
      setPlayingId(null);
      setError("Impossibile riprodurre questo messaggio vocale su questo dispositivo.");
    };
    setPlayingId(id);
    audio.play().catch(() => {
      setPlayingId(null);
      setError("Riproduzione audio bloccata. Riprova toccando di nuovo play.");
    });
  };

  // Cleanup del player allo smontaggio
  useEffect(() => () => { playerRef.current?.pause(); }, []);

  // Sblocca AudioContext al primo gesto utente sulla pagina
  useEffect(() => { setupNotificationAudio(); }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    // Suona se arrivano messaggi nuovi dall'altra parte (non dal ruolo corrente)
    if (initialMessages.length > prevMsgCount.current) {
      const newOnes = initialMessages.slice(prevMsgCount.current);
      const hasOtherParty = newOnes.some(m => m.role !== currentUserRole && m.role !== "SYSTEM");
      if (hasOtherParty) playNotificationSound();
    }
    prevMsgCount.current = initialMessages.length;
  }, [initialMessages, currentUserRole]);

  // Polling automatico: aggiorna i messaggi ogni 5 secondi quando la chat è aperta.
  // Necessario su iOS dove la notifica push non triggera un refresh automatico.
  useEffect(() => {
    const id = setInterval(() => { router.refresh(); }, 15000);
    const onVisible = () => { if (document.visibilityState === "visible") router.refresh(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => { clearInterval(id); document.removeEventListener("visibilitychange", onVisible); };
  }, [router]);

  useEffect(() => {
    return () => {
      timerRef.current && clearInterval(timerRef.current);
      barTimerRef.current && clearInterval(barTimerRef.current);
      recHandleRef.current?.cancel();
      audioUrl && URL.revokeObjectURL(audioUrl);
    };
  }, []);

  // ── Text / file submit ────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.append("role", currentUserRole);
    formData.append("senderName", currentUserName);

    const tempText = formData.get("text") as string;
    // Controlla entrambi gli input file (generico + foto)
    const fileGeneric = formData.get("files") as File | null;
    const fileImage = formData.get("imageFile") as File | null;
    const file = (fileGeneric && fileGeneric.size > 0) ? fileGeneric : (fileImage && fileImage.size > 0) ? fileImage : null;
    if (!tempText?.trim() && !file) return;

    if (file && file.size > 0) {
      setIsUploading(true);
      try {
        const blob = await upload(
          `uploads/tickets/${entityId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`,
          file,
          { access: "public", handleUploadUrl: "/api/blob-upload" }
        );
        formData.delete("files");
        formData.delete("imageFile");
        formData.append("blobUrl", blob.url);
        formData.append("blobFilename", file.name);
        formData.append("blobMimeType", file.type || "application/octet-stream");
        formData.append("blobSize", String(file.size));
      } catch {
        hapticError();
        setError("Errore durante il caricamento del file. Riprova.");
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    startTransition(async () => {
      try {
        const result = await submitAction(entityId, null, formData);
        if (result.success) {
          hapticMedium();
          formRef.current?.reset();
          setSelectedFileName(null);
          setSelectedFilePreview(null);
          router.refresh();
        } else if (result.error) {
          hapticError();
          setError(result.error);
        }
      } catch {
        hapticError();
        setError("Errore durante l'invio del messaggio.");
      }
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setSelectedFileName(file ? file.name : null);
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setSelectedFilePreview(url);
    } else {
      setSelectedFilePreview(null);
    }
  };

  // ── Voice recording ───────────────────────────────────────────────────────
  // Su app nativa usa il plugin AAC (cross-platform iOS/Android), nel browser
  // desktop usa MediaRecorder. Vedi src/lib/voice-recorder.ts.
  const startRecording = async () => {
    setError(null);
    try {
      const handle = await startVoiceRecording();
      recHandleRef.current = handle;
      setRecState("recording");
      setRecSecs(0);
      timerRef.current = setInterval(() => setRecSecs((s) => s + 1), 1000);
      barTimerRef.current = setInterval(() => {
        setBarHeights(Array.from({ length: 7 }, () => 3 + Math.random() * 17));
      }, 120);
    } catch (e) {
      if (e instanceof MicPermissionError) {
        setError("Permesso microfono negato. Abilitalo nelle impostazioni del dispositivo per PropOps.");
      } else {
        setError(e instanceof Error ? e.message : "Microfono non accessibile. Verifica il permesso del microfono.");
      }
    }
  };

  const stopRecording = async () => {
    timerRef.current && clearInterval(timerRef.current);
    barTimerRef.current && clearInterval(barTimerRef.current);
    const handle = recHandleRef.current;
    if (!handle) return;
    recHandleRef.current = null;
    try {
      const rec = await handle.stop();
      recExtRef.current = rec.ext;
      setAudioBlob(rec.blob);
      setAudioUrl(rec.url);
      setSavedDuration(Math.round(rec.durationMs / 1000) || recSecs);
      setRecState("preview");
    } catch {
      setError("Errore durante la registrazione. Riprova.");
      setRecState("idle");
    }
  };

  const cancelRecording = () => {
    timerRef.current && clearInterval(timerRef.current);
    barTimerRef.current && clearInterval(barTimerRef.current);
    recHandleRef.current?.cancel();
    recHandleRef.current = null;
    setRecState("idle");
    setAudioBlob(null);
    setAudioUrl(null);
    setRecSecs(0);
    setBarHeights(Array(7).fill(4));
  };

  const deletePreview = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setRecState("idle");
  };

  const sendVoice = async () => {
    if (!audioBlob) return;
    setIsUploading(true);
    setError(null);
    try {
      const ext = recExtRef.current || "m4a";
      const filename = `voice-${Date.now()}.${ext}`;
      const blob = await upload(
        `uploads/voice/${entityId}/${filename}`,
        audioBlob,
        { access: "public", handleUploadUrl: "/api/blob-upload" }
      );
      setIsUploading(false);

      const formData = new FormData();
      formData.append("role", currentUserRole);
      formData.append("senderName", currentUserName);
      formData.append("blobUrl", blob.url);
      formData.append("blobFilename", filename);
      formData.append("blobMimeType", audioBlob.type || "audio/aac");
      formData.append("blobSize", String(audioBlob.size));

      startTransition(async () => {
        try {
          const result = await submitAction(entityId, null, formData);
          if (result.success) {
            deletePreview();
            router.refresh();
          } else {
            setError(result.error || "Errore durante l'invio.");
          }
        } catch {
          setError("Errore durante l'invio del messaggio vocale.");
        }
      });
    } catch {
      setError("Errore durante il caricamento del vocale.");
      setIsUploading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className={`flex flex-col ${heightClass} border border-gray-100 rounded-2xl bg-gray-50/30`}>

      {/* Messages list */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth min-h-0">
        {initialMessages.length === 0 && (
          <div className="flex justify-center items-center h-full text-gray-400 text-xs">
            Nessun messaggio. Inizia la conversazione.
          </div>
        )}
        {initialMessages.map((msg) => {
          // System messages rendered as centered banners
          if (msg.role === "SYSTEM") {
            return (
              <div key={msg.id} className="flex justify-center my-1">
                <div className="flex items-center gap-2 rounded-full bg-yellow-50 border border-yellow-200 px-4 py-1.5 max-w-[90%]">
                  <span className="text-yellow-500 text-xs">⏳</span>
                  <p className="text-[11px] font-semibold text-yellow-700 text-center">{msg.text}</p>
                </div>
              </div>
            );
          }

          const isMe = msg.role === currentUserRole;
          const isAudio = msg.attachment?.fileType?.startsWith("audio/");
          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
              <div className={`max-w-[80%] rounded-2xl shadow-sm ${
                isAudio ? "" : "px-4 py-2"
              } ${isMe ? "bg-black text-white rounded-tr-none" : "bg-white text-gray-800 rounded-tl-none border border-gray-100"}`}>

                {/* Audio message */}
                {isAudio ? (
                  <div className={`flex items-center gap-3 px-3 py-2.5 min-w-[200px] ${isMe ? "bg-black rounded-2xl rounded-tr-none" : "bg-white rounded-2xl rounded-tl-none border border-gray-100"}`}>
                    <button
                      type="button"
                      onClick={() => togglePlay(`audio-${msg.id}`, msg.attachment.url)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isMe ? "bg-white/20 hover:bg-white/30" : "bg-violet-100 hover:bg-violet-200"} transition-colors`}
                    >
                      {playingId === `audio-${msg.id}` ? (
                        <svg width="11" height="11" viewBox="0 0 24 24" fill={isMe ? "#fff" : "#7c3aed"}><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>
                      ) : (
                        <svg width="11" height="11" viewBox="0 0 24 24" fill={isMe ? "#fff" : "#7c3aed"}><polygon points="5 3 19 12 5 21 5 3"/></svg>
                      )}
                    </button>
                    <WaveformBars
                      seed={msg.id}
                      color={isMe ? "#fff" : "#7c3aed"}
                      dimColor={isMe ? "rgba(255,255,255,0.35)" : "#c4b5fd"}
                    />
                    <span className={`text-[10px] font-semibold shrink-0 ${isMe ? "text-white/70" : "text-slate-400"}`}>
                      {msg.attachment.fileName.match(/voice-(\d+)\.(webm|mp4)/) ? "🎙" : "🎙"}
                    </span>
                  </div>
                ) : (
                  <>
                    <p className="text-[10px] font-bold opacity-60 mb-1">{msg.senderName}</p>
                    {msg.text && <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>}
                    {msg.attachment && (
                      <div className={`mt-2 p-2 rounded-xl border ${isMe ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-100"}`}>
                        {msg.attachment.fileType?.startsWith("image/") ? (
                          <a href={msg.attachment.url} target="_blank" rel="noreferrer">
                            <img src={msg.attachment.url} alt="Allegato" className="max-h-40 rounded-lg object-contain" />
                          </a>
                        ) : (
                          <a href={msg.attachment.url} target="_blank" rel="noreferrer"
                            className="flex items-center gap-2 text-[10px] font-bold uppercase truncate">
                            <span>📎</span> {msg.attachment.fileName}
                          </a>
                        )}
                      </div>
                    )}
                  </>
                )}

                <p className="text-[9px] mt-1 text-right opacity-50 px-1">
                  <SafeDate date={msg.createdAt} format={{ hour: "2-digit", minute: "2-digit" }} />
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input area */}
      <div className="p-3 bg-white border-t border-gray-100 rounded-b-2xl space-y-2">
        {error && (
          <div className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-[10px] font-bold animate-in fade-in slide-in-from-top-2">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* ── STATO: recording ── */}
        {recState === "recording" && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-3 py-2">
            {/* Cancel */}
            <button type="button" onClick={cancelRecording}
              className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center shrink-0 hover:bg-red-200 transition-colors">
              <svg width="12" height="12" fill="none" stroke="#ef4444" stroke-width="2.5" viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            {/* Animated bars */}
            <div className="flex items-center gap-[3px] flex-1 h-6">
              {barHeights.map((h, i) => (
                <div key={i} style={{ height: h, background: "#f43f5e", width: 3, borderRadius: 99, transition: "height 100ms ease" }} />
              ))}
            </div>
            {/* Timer */}
            <span className="text-sm font-black text-red-500 tabular-nums min-w-[32px] text-right">{formatDur(recSecs)}</span>
            {/* Stop button (pulsing) */}
            <button type="button" onClick={stopRecording}
              className="relative w-9 h-9 flex items-center justify-center shrink-0">
              <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-40" />
              <span className="relative w-9 h-9 bg-red-500 rounded-full flex items-center justify-center shadow-lg shadow-red-200">
                <svg width="13" height="13" fill="none" stroke="#fff" stroke-width="1.8" viewBox="0 0 24 24">
                  <rect x="9" y="2" width="6" height="11" rx="3"/>
                  <path d="M5 10a7 7 0 0 0 14 0"/>
                  <line x1="12" y1="19" x2="12" y2="22"/>
                </svg>
              </span>
            </button>
          </div>
        )}

        {/* ── STATO: preview ── */}
        {recState === "preview" && (
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2">
            {/* Delete */}
            <button type="button" onClick={deletePreview}
              className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center shrink-0 hover:bg-red-200 transition-colors">
              <svg width="12" height="12" fill="none" stroke="#ef4444" stroke-width="2" viewBox="0 0 24 24">
                <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
              </svg>
            </button>
            {/* Play preview */}
            <button type="button"
              onClick={() => { if (audioUrl) togglePlay("preview-audio", audioUrl); }}
              className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center shrink-0 hover:bg-violet-700 transition-colors shadow-md shadow-violet-200">
              {playingId === "preview-audio" ? (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="#fff"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>
              ) : (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="#fff"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              )}
            </button>
            {/* Static waveform */}
            <WaveformBars seed={`preview-${savedDuration}`} color="#7c3aed" dimColor="#c4b5fd" />
            <span className="text-[10px] font-bold text-slate-500 shrink-0">{formatDur(savedDuration)}</span>
            {/* Send */}
            <button type="button" onClick={sendVoice} disabled={isUploading || isPending}
              className="w-8 h-8 bg-violet-600 rounded-xl flex items-center justify-center shrink-0 hover:bg-violet-700 transition-colors shadow-md shadow-violet-200 disabled:opacity-50">
              {isUploading || isPending ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              )}
            </button>
          </div>
        )}

        {/* ── STATO: idle — normal input ── */}
        {recState === "idle" && (
          <form ref={formRef} onSubmit={handleSubmit}>
            {selectedFileName && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-bold mb-2 animate-in fade-in ${
                isUploading ? "bg-blue-100 text-blue-600" : isPending ? "bg-gray-100 text-gray-500" : "bg-blue-50 text-blue-700"
              }`}>
                {selectedFilePreview ? (
                  <img src={selectedFilePreview} alt="Preview" className="w-10 h-10 rounded-lg object-cover shrink-0 border border-blue-200" />
                ) : null}
                <span className="truncate flex-1">{isUploading ? "📤 Caricamento: " : isPending ? "📤 Inviando: " : selectedFilePreview ? "🖼 " : "📎 "}{selectedFileName}</span>
                {!isPending && !isUploading && (
                  <button type="button" onClick={() => {
                    if (fileInputRef.current) fileInputRef.current.value = "";
                    if (imageInputRef.current) imageInputRef.current.value = "";
                    setSelectedFileName(null);
                    setSelectedFilePreview(null);
                  }} className="ml-1 hover:opacity-70 shrink-0">✕</button>
                )}
              </div>
            )}
            <div className="flex items-center gap-1.5">
              {/* Attachment generico */}
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors shrink-0"
                title="Allega file">
                <span className="text-lg">📎</span>
                <input ref={fileInputRef} type="file" name="files" className="hidden" onChange={handleFileChange} />
              </button>
              {/* Foto / fotocamera */}
              <button type="button" onClick={() => imageInputRef.current?.click()}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors shrink-0"
                title="Invia foto">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                <input ref={imageInputRef} type="file" name="imageFile" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
              </button>
              {/* Text input */}
              <input autoComplete="off" type="text" name="text"
                placeholder="Scrivi un messaggio..."
                className="flex-1 min-w-0 bg-gray-50 border-none rounded-2xl px-3 py-2 text-sm focus:ring-2 focus:ring-black transition-all outline-none" />
              {/* Mic button */}
              <button type="button" onClick={startRecording}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors shrink-0"
                title="Registra messaggio vocale">
                <svg width="16" height="16" fill="none" stroke="#475569" stroke-width="1.8" viewBox="0 0 24 24">
                  <rect x="9" y="2" width="6" height="11" rx="3"/>
                  <path d="M5 10a7 7 0 0 0 14 0"/>
                  <line x1="12" y1="19" x2="12" y2="22"/>
                  <line x1="8" y1="22" x2="16" y2="22"/>
                </svg>
              </button>
              {/* Send */}
              <button type="submit" disabled={isPending || isUploading}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-black text-white hover:bg-gray-800 active:scale-95 transition-all shadow-md shadow-gray-200 disabled:opacity-50 shrink-0">
                {isPending || isUploading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 translate-x-px">
                    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                  </svg>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
