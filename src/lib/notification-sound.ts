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

function doPing(c: AudioContext, startTime: number, freq: number, vol = 0.45, duration = 0.35) {
  const osc  = c.createOscillator();
  const gain = c.createGain();
  osc.connect(gain);
  gain.connect(c.destination);
  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(vol, startTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  osc.start(startTime);
  osc.stop(startTime + duration);
}

/** Suona un triplo ping crescente — usato per le push notification in arrivo. */
export function playPushAlertSound() {
  try {
    const c = getOrCreateCtx();
    if (!c) return;

    const play = () => {
      const t = c.currentTime;
      doPing(c, t,        660, 0.5,  0.3);
      doPing(c, t + 0.15, 880, 0.6,  0.3);
      doPing(c, t + 0.30, 1100, 0.7, 0.4);
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

/** Suono forte per nuovo messaggio — triplo beep incisivo. */
export function playNotificationSound() {
  try {
    const c = getOrCreateCtx();
    if (!c) return;

    const play = () => {
      const t = c.currentTime;
      doPing(c, t,        1000, 0.55, 0.25);
      doPing(c, t + 0.18, 1200, 0.6,  0.25);
      doPing(c, t + 0.36, 1400, 0.65, 0.35);
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

/** Beep singolo per polling messaggi — usato dai componenti chat/button. */
export function playMessageBeep() {
  try {
    const c = getOrCreateCtx();
    if (!c) return;

    const play = () => {
      const t = c.currentTime;
      doPing(c, t,        880, 0.5,  0.2);
      doPing(c, t + 0.12, 1100, 0.55, 0.2);
      doPing(c, t + 0.24, 1320, 0.6,  0.3);
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
