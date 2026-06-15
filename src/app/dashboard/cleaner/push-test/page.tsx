"use client";

import { useEffect, useState, useCallback } from "react";

const VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const arr = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) arr[i] = rawData.charCodeAt(i);
  return arr.buffer;
}

function now() {
  return new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

interface LogEntry { ts: string; level: "info" | "ok" | "warn" | "error"; msg: string; }

export default function CleanerPushTestPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [swOk, setSwOk] = useState(false);
  const [permOk, setPermOk] = useState(false);
  const [subOk, setSubOk] = useState(false);
  const [dbCount, setDbCount] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  function log(level: LogEntry["level"], msg: string) {
    setLogs(prev => [{ ts: now(), level, msg }, ...prev].slice(0, 60));
  }

  const checkAll = useCallback(async () => {
    log("info", "── Controllo stato push ──");

    // 1. Service Worker
    if (!("serviceWorker" in navigator)) {
      log("error", "Service Worker NON supportato (Capacitor/WKWebView?)");
    } else {
      const regs = await navigator.serviceWorker.getRegistrations();
      if (regs.length === 0) {
        log("warn", "Nessun Service Worker registrato");
      } else {
        const active = regs[0].active;
        setSwOk(!!active);
        log(active ? "ok" : "warn", `SW: ${active ? "attivo" : "non attivo"} — scope: ${regs[0].scope}`);
      }
    }

    // 2. Permessi
    if (!("Notification" in window)) {
      log("error", "Notification API non supportata");
    } else {
      const perm = Notification.permission;
      setPermOk(perm === "granted");
      log(perm === "granted" ? "ok" : perm === "denied" ? "error" : "warn",
        `Permesso notifiche: ${perm}`);
    }

    // 3. Subscription browser
    if ("PushManager" in window && "serviceWorker" in navigator) {
      try {
        const reg = await navigator.serviceWorker.ready;
        const s = await reg.pushManager.getSubscription();
        setSubOk(!!s);
        log(s ? "ok" : "warn", s
          ? `Subscription browser attiva: ...${s.endpoint.slice(-30)}`
          : "Nessuna subscription nel browser");
      } catch (e) {
        log("error", `Errore subscription: ${e}`);
      }
    }

    // 4. DB subscriptions
    try {
      const res = await fetch("/api/push/debug");
      if (res.ok) {
        const data = await res.json();
        setDbCount(data.total);
        log(data.total > 0 ? "ok" : "warn", `DB: ${data.total} subscription registrate`);
        data.subscriptions?.forEach((s: any) =>
          log("info", `  → ${s.user} (${s.role}) ...${s.endpointShort}`)
        );
      }
    } catch (e) {
      log("error", `Errore lettura DB: ${e}`);
    }
  }, []);

  useEffect(() => { checkAll(); }, [checkAll]);

  async function handleRegister() {
    setBusy(true);
    try {
      log("info", "Richiedo permesso notifiche...");
      const perm = await Notification.requestPermission();
      log(perm === "granted" ? "ok" : "error", `Permesso: ${perm}`);
      if (perm !== "granted") { setBusy(false); return; }

      log("info", "Attendo Service Worker...");
      const reg = await navigator.serviceWorker.ready;
      log("ok", "SW ready");

      let sub = await reg.pushManager.getSubscription();
      if (sub) {
        log("info", "Subscription già presente, riuso");
      } else {
        log("info", "Creo nuova subscription...");
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_KEY),
        });
        log("ok", `Subscription creata: ...${sub.endpoint.slice(-30)}`);
      }

      log("info", "Salvo nel DB...");
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });
      const body = await res.json();
      if (!res.ok) {
        log("error", `Salvataggio fallito: ${JSON.stringify(body)}`);
      } else {
        log("ok", "Subscription salvata nel DB ✓");
      }
      await checkAll();
    } catch (e) {
      log("error", `Errore: ${e}`);
    }
    setBusy(false);
  }

  async function handleLocalTest() {
    if (Notification.permission !== "granted") {
      log("warn", "Permesso non concesso"); return;
    }
    try {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification("🔔 Test locale", {
        body: "Notifica diretta dal Service Worker — nessun server coinvolto",
        icon: "/icons/icon-192.png",
        tag: "local-test",
      });
      log("ok", "Notifica locale inviata — deve apparire subito");
    } catch (e) {
      log("error", `Errore: ${e}`);
    }
  }

  async function handleServerTest() {
    setBusy(true);
    log("info", "Invio push dal server → me stesso...");
    try {
      const res = await fetch("/api/push/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: "self" }),
      });
      const body = await res.json();
      if (!res.ok) {
        log("error", `Errore server: ${JSON.stringify(body)}`);
      } else {
        log("ok", "Push server inviata — aspetta 5-10s...");
      }
    } catch (e) {
      log("error", `Errore: ${e}`);
    }
    setBusy(false);
  }

  const Dot = ({ ok, warn }: { ok: boolean; warn?: boolean }) => (
    <span className={`inline-block w-2.5 h-2.5 rounded-full mr-2 shrink-0 ${ok ? "bg-emerald-400" : warn ? "bg-amber-400" : "bg-red-400"}`} />
  );

  const logColor = { info: "text-slate-400", ok: "text-emerald-400", warn: "text-amber-400", error: "text-red-400" } as const;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 font-mono text-sm">
      <div className="max-w-xl mx-auto space-y-5">

        <div>
          <h1 className="text-lg font-bold">🔔 Push Test — Cleaner</h1>
          <p className="text-slate-500 text-xs mt-1">Diagnostica notifiche push su questo dispositivo</p>
        </div>

        {/* Stato */}
        <div className="bg-slate-900 rounded-xl p-4 space-y-2">
          <p className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-3">Stato</p>
          <p className="flex items-center"><Dot ok={swOk} />Service Worker attivo</p>
          <p className="flex items-center"><Dot ok={permOk} />Permesso notifiche granted</p>
          <p className="flex items-center"><Dot ok={subOk} />Subscription browser attiva</p>
          <p className="flex items-center">
            <Dot ok={(dbCount ?? 0) > 0} warn={dbCount === null} />
            DB: {dbCount === null ? "caricamento..." : `${dbCount} subscription registrate`}
          </p>
        </div>

        {/* Azioni */}
        <div className="bg-slate-900 rounded-xl p-4 space-y-3">
          <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">Azioni</p>
          <button onClick={handleRegister} disabled={busy}
            className="w-full py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-colors">
            {busy ? "⏳ Attendi..." : "① Registra questo dispositivo"}
          </button>
          <button onClick={handleLocalTest} disabled={busy}
            className="w-full py-3 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-colors">
            ② Test locale (senza server)
          </button>
          <button onClick={handleServerTest} disabled={busy}
            className="w-full py-3 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-colors">
            ③ Test push dal server
          </button>
          <button onClick={checkAll} disabled={busy}
            className="w-full py-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-colors">
            Aggiorna stato
          </button>
        </div>

        {/* Istruzioni */}
        <div className="bg-slate-900 rounded-xl p-4 text-xs text-slate-400 space-y-1.5">
          <p><span className="text-violet-400">①</span> Registra prima il dispositivo</p>
          <p><span className="text-amber-400">②</span> Test locale — deve arrivare subito. Se non arriva: problema SW o permessi</p>
          <p><span className="text-emerald-400">③</span> Test server — passa da Vercel. Se ② funziona ma ③ no: problema VAPID o APNs</p>
        </div>

        {/* Log */}
        <div className="bg-black rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">Log</p>
            {logs.length > 0 && (
              <button onClick={() => setLogs([])} className="text-[10px] text-slate-600 hover:text-slate-400">Pulisci</button>
            )}
          </div>
          <div className="space-y-0.5 max-h-72 overflow-y-auto">
            {logs.length === 0 && <p className="text-slate-600 text-xs">In attesa...</p>}
            {logs.map((e, i) => (
              <p key={i} className={`text-xs ${logColor[e.level]}`}>
                <span className="text-slate-600">[{e.ts}]</span> {e.msg}
              </p>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
