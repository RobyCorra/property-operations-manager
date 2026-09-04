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

    // Elementi per cui abbiamo appena emesso un click sintetico: sopprimiamo il
    // click nativo (isTrusted) che arriva subito dopo per lo stesso elemento.
    // Una Map (elemento → scadenza) gestisce correttamente tap rapidi in
    // sequenza su pulsanti diversi.
    const suppress = new Map<HTMLElement, number>();

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

      suppress.set(el, Date.now() + 800);
      el.click(); // click sintetico (isTrusted = false) → parte subito l'azione
    }

    // Cattura il click nativo che segue e lo blocca (una sola volta per elemento).
    function onClickCapture(e: MouseEvent) {
      if (suppress.size === 0 || !e.isTrusted) return; // il sintetico deve passare
      const now = Date.now();
      const t = e.target as HTMLElement | null;
      for (const [el, exp] of suppress) {
        if (exp < now) { suppress.delete(el); continue; }
        if (t && (t === el || el.contains(t) || t.contains(el))) {
          e.stopPropagation();
          e.preventDefault();
          suppress.delete(el);
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
