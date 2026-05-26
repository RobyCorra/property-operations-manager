/**
 * Suono di notifica messaggio — generato via Web Audio API.
 * Nessun file esterno, funziona su desktop e mobile.
 */
export function playNotificationSound() {
  try {
    const Ctx = window.AudioContext ?? (window as any).webkitAudioContext;
    if (!Ctx) return;

    const ctx = new Ctx() as AudioContext;

    function ping(startTime: number, freq: number, vol = 0.18) {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(vol, startTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);
      osc.start(startTime);
      osc.stop(startTime + 0.5);
    }

    const t = ctx.currentTime;
    ping(t,        880);   // La5  — prima nota
    ping(t + 0.14, 1320);  // Mi6  — seconda nota (accordo più caldo)

    // Chiudi il contesto audio dopo la riproduzione
    setTimeout(() => ctx.close().catch(() => {}), 1200);
  } catch {
    // Fail silenzioso — browser senza Web Audio API o policy audio
  }
}
