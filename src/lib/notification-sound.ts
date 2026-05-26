/**
 * Suono di notifica messaggio — Web Audio API.
 *
 * L'AudioContext viene sbloccato al PRIMO gesto utente sulla pagina
 * (qualsiasi click o tap), non solo sui pulsanti di invio.
 * Questo garantisce che il suono funzioni anche per chi sta solo
 * aspettando messaggi senza scrivere nulla.
 */

let ctx: AudioContext | null = null;
let isSetup = false;

function getOrCreateCtx(): AudioContext | null {
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

function doUnlock() {
  const c = getOrCreateCtx();
  if (c && c.state === "suspended") {
    c.resume().catch(() => {});
  }
}

/**
 * Registra un listener globale che sblocca l'AudioContext al primo
 * click/tap sulla pagina. Va chiamato una volta in un useEffect.
 */
export function setupNotificationAudio() {
  if (typeof window === "undefined" || isSetup) return;
  isSetup = true;

  const unlock = () => {
    doUnlock();
    window.removeEventListener("click",      unlock, true);
    window.removeEventListener("touchstart", unlock, true);
    window.removeEventListener("keydown",    unlock, true);
  };

  window.addEventListener("click",      unlock, { capture: true, passive: true });
  window.addEventListener("touchstart", unlock, { capture: true, passive: true });
  window.addEventListener("keydown",    unlock, { capture: true, passive: true });
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

/** Suona un doppio ping. Funziona dopo il primo gesto utente sulla pagina. */
export function playNotificationSound() {
  try {
    const c = getOrCreateCtx();
    if (!c) return;

    const play = () => {
      const t = c.currentTime;
      doPing(c, t,        880);
      doPing(c, t + 0.14, 1320);
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
