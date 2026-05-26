/**
 * Suono di notifica messaggio — Web Audio API con pattern "unlock".
 *
 * I browser bloccano l'audio se l'AudioContext viene creato fuori da un
 * gesto utente diretto (es. dentro setInterval/setTimeout).
 * Soluzione: creare/sbloccare il contesto al primo gesto, poi riusarlo.
 *
 * Uso:
 *   - chiamare unlockAudio() su onClick/onTouchStart di qualsiasi pulsante
 *   - chiamare playNotificationSound() quando arriva un messaggio nuovo
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  try {
    if (ctx && ctx.state !== "closed") return ctx;
    const Klass = window.AudioContext ?? (window as any).webkitAudioContext;
    if (!Klass) return null;
    ctx = new Klass() as AudioContext;
    return ctx;
  } catch {
    return null;
  }
}

/** Chiama questo su ogni click/tap per sbloccare l'audio sul dispositivo. */
export function unlockAudio() {
  const c = getCtx();
  if (c && c.state === "suspended") {
    c.resume().catch(() => {});
  }
}

function doPing(c: AudioContext, startTime: number, freq: number, vol = 0.18) {
  const osc  = c.createOscillator();
  const gain = c.createGain();
  osc.connect(gain);
  gain.connect(c.destination);
  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(vol, startTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);
  osc.start(startTime);
  osc.stop(startTime + 0.5);
}

/** Suona un doppio ping (La5 + Mi6). Funziona solo dopo unlockAudio(). */
export function playNotificationSound() {
  try {
    const c = getCtx();
    if (!c) return;

    const play = () => {
      const t = c.currentTime;
      doPing(c, t,        880);   // La5
      doPing(c, t + 0.14, 1320);  // Mi6
    };

    if (c.state === "suspended") {
      c.resume().then(play).catch(() => {});
    } else {
      play();
    }
  } catch {
    // Fail silenzioso
  }
}
