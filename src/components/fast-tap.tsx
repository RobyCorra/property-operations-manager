"use client";

import { useEffect } from "react";

/**
 * FastTap — risposta al tocco immediata su WebView (iOS/Android).
 *
 * Problema: per i pulsanti dentro aree scrollabili, il browser aspetta a far
 * partire il click perché deve capire se stai toccando o iniziando a scorrere.
 * Un tap "deciso" (veloce e fermo) viene riconosciuto subito; un tap morbido o
 * con un micro-movimento del dito viene trattenuto/annullato → sembra lento.
 *
 * Soluzione: al sollevamento del dito (pointerup), se il movimento è piccolo e
 * il tocco è stato breve, facciamo partire subito il click sull'elemento —
 * senza aspettare la disambiguazione del browser. Poi sopprimiamo il click
 * "vero" che il browser emette ~300ms dopo, per non eseguire l'azione due volte.
 *
 * Sicurezza:
 *  - Solo input di tipo "touch" (mouse/trackpad già istantanei).
 *  - Solo su button / [role=button] / a[href]; MAI su campi di testo,
 *    select, contenteditable (lì servono focus/selezione nativi).
 *  - Soglia movimento 10px → sotto = tap, sopra = scroll (lasciato al browser).
 *  - Opt-out con l'attributo data-no-fasttap su un elemento o un suo antenato.
 */
export default function FastTap() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    // Solo dispositivi touch: su desktop il click è già istantaneo.
    const isTouch = window.matchMedia?.("(hover: none) and (pointer: coarse)").matches;
    if (!isTouch) return;

    const MOVE_THRESHOLD = 10; // px
    const MAX_DURATION = 700;  // ms

    let startX = 0;
    let startY = 0;
    let startT = 0;
    let tracking = false;
    let targetEl: HTMLElement | null = null;

    // Dopo un click sintetico, il browser emette comunque un click "vero"
    // (isTrusted) ~300ms dopo. Va soppresso, altrimenti l'azione parte due volte
    // — ma soprattutto, se il tap ha cambiato la UI (es. chiuso un pannello), il
    // click vero cade sul contenuto ora rivelato NELLA STESSA POSIZIONE dello
    // schermo → "ghost click" (es. riapre la card che sta sotto la freccia).
    // Per questo sopprimiamo per COORDINATE (stessa posizione del tap), non per
    // elemento: così becchiamo il ghost anche quando l'elemento sotto è cambiato.
    const SUPPRESS_RADIUS = 24; // px
    const SUPPRESS_MS = 700;
    const recentTaps: { x: number; y: number; exp: number }[] = [];

    function actionable(node: EventTarget | null): HTMLElement | null {
      let el = node as HTMLElement | null;
      if (!el || typeof el.closest !== "function") return null;
      // Escludi campi che hanno bisogno del comportamento nativo
      if (el.closest("input, textarea, select, [contenteditable=''], [contenteditable='true'], [data-no-fasttap]")) {
        return null;
      }
      return el.closest("button, [role='button'], a[href]") as HTMLElement | null;
    }

    function onPointerDown(e: PointerEvent) {
      if (e.pointerType !== "touch" || !e.isPrimary) { tracking = false; return; }
      const el = actionable(e.target);
      if (!el || (el as HTMLButtonElement).disabled) { tracking = false; targetEl = null; return; }
      tracking = true;
      targetEl = el;
      startX = e.clientX;
      startY = e.clientY;
      startT = Date.now();
    }

    function onPointerMove(e: PointerEvent) {
      if (!tracking) return;
      if (Math.abs(e.clientX - startX) > MOVE_THRESHOLD || Math.abs(e.clientY - startY) > MOVE_THRESHOLD) {
        tracking = false; // è uno scroll: lascia fare al browser
        targetEl = null;
      }
    }

    function onPointerUp(e: PointerEvent) {
      if (!tracking || !targetEl) { tracking = false; return; }
      tracking = false;
      const el = targetEl;
      targetEl = null;

      if (Date.now() - startT > MAX_DURATION) return; // long-press: non è un tap
      // Se l'utente ha selezionato del testo, non è un tap.
      const sel = window.getSelection?.();
      if (sel && sel.toString().length > 0) return;
      // Il dito deve essere ancora sopra lo stesso elemento
      const up = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
      if (!up || (up !== el && !el.contains(up) && !up.contains(el))) return;

      recentTaps.push({ x: e.clientX, y: e.clientY, exp: Date.now() + SUPPRESS_MS });
      el.click(); // click sintetico (isTrusted = false) → parte subito l'azione
    }

    // Cattura il click nativo che segue e lo blocca. Confronto per coordinate:
    // il ghost/trailing click arriva nella stessa posizione del tap.
    function onClickCapture(e: MouseEvent) {
      if (!e.isTrusted) return; // il nostro sintetico deve passare
      const now = Date.now();
      // Pulisci le voci scadute
      for (let i = recentTaps.length - 1; i >= 0; i--) {
        if (recentTaps[i].exp < now) recentTaps.splice(i, 1);
      }
      for (let i = 0; i < recentTaps.length; i++) {
        const tap = recentTaps[i];
        if (Math.abs(e.clientX - tap.x) <= SUPPRESS_RADIUS && Math.abs(e.clientY - tap.y) <= SUPPRESS_RADIUS) {
          e.stopPropagation();
          e.preventDefault();
          recentTaps.splice(i, 1);
          return;
        }
      }
    }

    document.addEventListener("pointerdown", onPointerDown, { passive: true });
    document.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerup", onPointerUp, { passive: true });
    document.addEventListener("click", onClickCapture, { capture: true });

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("click", onClickCapture, { capture: true } as any);
    };
  }, []);

  return null;
}
