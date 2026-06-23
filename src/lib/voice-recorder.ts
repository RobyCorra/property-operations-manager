import { Capacitor } from "@capacitor/core";
import { VoiceRecorder } from "capacitor-voice-recorder";

// Registrazione vocale cross-platform — obiettivo: file SEMPRE in AAC/mp4, così
// iOS e Android possono riprodurre i vocali l'uno dell'altro.
//
// - Android nativo: usa il plugin nativo capacitor-voice-recorder (registra AAC).
//   La System WebView di Android registrerebbe webm/opus, che iOS NON sa riprodurre,
//   e per giunta il microfono nella WebView è inaffidabile. Il plugin risolve entrambi.
// - iOS nativo: MediaRecorder in WKWebView produce GIÀ audio/mp4 (AAC), riproducibile
//   ovunque. Non serve il plugin (che peraltro non supporta lo Swift Package Manager
//   usato dal progetto iOS), quindi restiamo su MediaRecorder.
// - Browser desktop: MediaRecorder (preferendo mp4 dove supportato).

export type VoiceRecording = {
  blob: Blob;
  mimeType: string;
  durationMs: number;
  url: string;
  /** estensione file coerente col mimeType ("m4a" | "webm" | "mp4") */
  ext: string;
};

export interface VoiceRecorderHandle {
  stop: () => Promise<VoiceRecording>;
  cancel: () => void;
}

export class MicPermissionError extends Error {
  constructor() {
    super("PERMISSION_DENIED");
    this.name = "MicPermissionError";
  }
}

function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteChars = atob(base64);
  const bytes = new Uint8Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) bytes[i] = byteChars.charCodeAt(i);
  return new Blob([bytes], { type: mimeType });
}

function extFromMime(mimeType: string): string {
  if (mimeType.includes("aac") || mimeType.includes("m4a") || mimeType.includes("mp4")) return "m4a";
  if (mimeType.includes("webm")) return "webm";
  if (mimeType.includes("ogg")) return "ogg";
  return "m4a";
}

export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform();
}

export async function startVoiceRecording(): Promise<VoiceRecorderHandle> {
  // ── Android nativo: plugin AAC ──────────────────────────────────────────────
  if (Capacitor.getPlatform() === "android") {
    // Verifica/Richiesta permesso. Non inghiottiamo le eccezioni: se il plugin
    // non è presente nella build nativa, l'errore è diverso da "permesso negato"
    // e va mostrato così com'è (altrimenti sembra un falso "permesso negato").
    let granted = false;
    try {
      const has = await VoiceRecorder.hasAudioRecordingPermission();
      granted = has.value;
      if (!granted) {
        const req = await VoiceRecorder.requestAudioRecordingPermission();
        granted = req.value;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Registratore vocale nativo non disponibile (${msg}). Ricompila l'app Android.`);
    }
    if (!granted) throw new MicPermissionError();
    await VoiceRecorder.startRecording();
    return {
      stop: async () => {
        const res = await VoiceRecorder.stopRecording();
        const { recordDataBase64, msDuration, mimeType } = res.value;
        // Il plugin è patchato (patches/) per registrare in contenitore MP4/M4A
        // (audio/mp4) invece di AAC grezzo (ADTS), così iOS può riprodurlo.
        const type = mimeType && mimeType.length > 0 ? mimeType : "audio/mp4";
        const blob = base64ToBlob(recordDataBase64 ?? "", type);
        return {
          blob,
          mimeType: type,
          durationMs: msDuration,
          url: URL.createObjectURL(blob),
          ext: extFromMime(type),
        };
      },
      cancel: () => { VoiceRecorder.stopRecording().catch(() => {}); },
    };
  }

  // ── iOS nativo + browser desktop: MediaRecorder ─────────────────────────────
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mimeType = MediaRecorder.isTypeSupported("audio/mp4")
    ? "audio/mp4"
    : MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
    ? "audio/webm;codecs=opus"
    : "";
  const mr = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
  const chunks: Blob[] = [];
  const startTime = Date.now();
  mr.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
  mr.start(100);

  const cleanup = () => stream.getTracks().forEach((t) => t.stop());

  return {
    stop: () =>
      new Promise<VoiceRecording>((resolve) => {
        mr.onstop = () => {
          cleanup();
          const type = mr.mimeType || "audio/webm";
          const blob = new Blob(chunks, { type });
          resolve({
            blob,
            mimeType: type,
            durationMs: Date.now() - startTime,
            url: URL.createObjectURL(blob),
            ext: extFromMime(type),
          });
        };
        try { mr.stop(); } catch { cleanup(); }
      }),
    cancel: () => { try { mr.stop(); } catch { /* noop */ } cleanup(); },
  };
}
