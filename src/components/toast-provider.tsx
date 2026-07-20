"use client";

import { createContext, Suspense, useCallback, useContext, useState } from "react";
import { Check, AlertCircle, Info } from "lucide-react";
import ToastOnRedirect from "@/src/components/toast-on-redirect";

type ToastKind = "success" | "error" | "info";

interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastApi {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

/** Durata di permanenza del toast a schermo (ms). */
const TOAST_MS = 2500;

const STYLES: Record<ToastKind, { box: string; icon: React.ReactNode }> = {
  success: {
    box: "bg-emerald-600 text-white",
    icon: <Check size={16} strokeWidth={3} />,
  },
  error: {
    box: "bg-rose-600 text-white",
    icon: <AlertCircle size={16} strokeWidth={2.5} />,
  },
  info: {
    box: "bg-slate-900 text-white",
    icon: <Info size={16} strokeWidth={2.5} />,
  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const push = useCallback((kind: ToastKind, message: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, kind, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, TOAST_MS);
  }, []);

  const api: ToastApi = {
    success: useCallback((m: string) => push("success", m), [push]),
    error: useCallback((m: string) => push("error", m), [push]),
    info: useCallback((m: string) => push("info", m), [push]),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <Suspense fallback={null}>
        <ToastOnRedirect />
      </Suspense>
      <div
        className="fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 px-4 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pointer-events-none"
        role="status"
        aria-live="polite"
      >
        {toasts.map((t) => {
          const s = STYLES[t.kind];
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-center gap-2.5 rounded-full px-5 py-3 text-sm font-semibold shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 ${s.box}`}
            >
              {s.icon}
              <span>{t.message}</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

/**
 * Riscontro visivo delle azioni. Se nessun provider è montato i toast
 * vengono ignorati silenziosamente, così i componenti restano usabili
 * anche fuori dal layout principale (es. viste pubbliche via token).
 */
export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  const noop = useCallback(() => {}, []);
  return ctx ?? { success: noop, error: noop, info: noop };
}
