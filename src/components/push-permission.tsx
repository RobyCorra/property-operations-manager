"use client";

import { useEffect, useState } from "react";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const arr = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) arr[i] = rawData.charCodeAt(i);
  return arr.buffer;
}

type State = "idle" | "prompt" | "subscribing" | "subscribed" | "error" | "denied" | "unsupported";

export default function PushPermissionRequest() {
  const [state, setState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      setState("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setState("denied");
      return;
    }
    if (Notification.permission === "granted") {
      // Sempre re-registra la subscription ad ogni caricamento (per aggiornamenti SW)
      ensureSubscribed().then((ok) => setState(ok ? "subscribed" : "error"));
    } else {
      setState("prompt");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function ensureSubscribed(): Promise<boolean> {
    try {
      // Aspetta che il SW sia pronto (max 5s)
      const reg = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error("SW timeout")), 5000)),
      ]) as ServiceWorkerRegistration;

      // Forza aggiornamento SW per avere il push handler aggiornato
      await reg.update().catch(() => {});

      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
      }

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        console.error("Push subscribe API error:", body);
        setErrorMsg(`API error: ${body.error ?? res.status}`);
        return false;
      }

      console.log("[Push] Subscription saved successfully");
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[Push] ensureSubscribed error:", msg);
      setErrorMsg(msg);
      return false;
    }
  }

  async function handleAllow() {
    setState("subscribing");
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const ok = await ensureSubscribed();
      setState(ok ? "subscribed" : "error");
    } else {
      setState("denied");
    }
  }

  if (state === "unsupported" || state === "idle" || state === "subscribed" || state === "denied") {
    return null;
  }

  if (state === "error") {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto">
        <div className="bg-red-900 text-white rounded-2xl shadow-2xl p-4 flex items-start gap-3">
          <div className="text-2xl flex-shrink-0">⚠️</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold">Errore notifiche push</p>
            <p className="text-xs text-red-300 mt-0.5 break-words">{errorMsg || "Impossibile registrare la subscription."}</p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => { setState("subscribing"); ensureSubscribed().then(ok => setState(ok ? "subscribed" : "error")); }}
                className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-full transition-colors"
              >
                Riprova
              </button>
              <button
                onClick={() => setState("denied")}
                className="px-4 py-2 bg-red-800 text-red-300 text-xs font-bold rounded-full"
              >
                Ignora
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (state === "subscribing") {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto">
        <div className="bg-slate-900 text-white rounded-2xl shadow-2xl p-4 flex items-center gap-3">
          <div className="text-2xl flex-shrink-0 animate-spin">⚙️</div>
          <p className="text-sm font-bold">Registrazione notifiche...</p>
        </div>
      </div>
    );
  }

  // state === "prompt"
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto">
      <div className="bg-slate-900 text-white rounded-2xl shadow-2xl p-4 flex items-start gap-3">
        <div className="text-2xl flex-shrink-0">🔔</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold">Abilita notifiche push</p>
          <p className="text-xs text-slate-400 mt-0.5">
            Ricevi aggiornamenti in tempo reale su pulizie, ticket e scorte.
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleAllow}
              className="flex-1 py-2 bg-violet-500 hover:bg-violet-400 text-white text-xs font-bold rounded-full transition-colors"
            >
              Consenti
            </button>
            <button
              onClick={() => setState("denied")}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-bold rounded-full transition-colors"
            >
              Non ora
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
