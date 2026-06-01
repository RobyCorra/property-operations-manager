"use client";

import { useEffect, useState, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SwStatus {
  supported: boolean;
  registered: boolean;
  active: boolean;
  scope?: string;
  state?: string;
}

interface SubStatus {
  permission: string;
  subscribed: boolean;
  endpoint?: string;
}

interface DbStatus {
  total: number;
  subscriptions: { user: string; role: string; endpointShort: string; createdAt: string }[];
}

interface LogEntry {
  ts: string;
  level: "info" | "ok" | "warn" | "error";
  msg: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Component ────────────────────────────────────────────────────────────────

export default function PushTestPage() {
  const [sw, setSw] = useState<SwStatus>({ supported: false, registered: false, active: false });
  const [sub, setSub] = useState<SubStatus>({ permission: "default", subscribed: false });
  const [db, setDb] = useState<DbStatus | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [sending, setSending] = useState(false);

  function log(level: LogEntry["level"], msg: string) {
    setLogs(prev => [{ ts: now(), level, msg }, ...prev].slice(0, 80));
  }

  // ── Check SW ─────────────────────────────────────────────────────────────

  const checkSW = useCallback(async () => {
    if (!("serviceWorker" in navigator)) {
      setSw({ supported: false, registered: false, active: false });
      log("warn", "Service Worker NON supportato da questo browser");
      return;
    }
    setSw(prev => ({ ...prev, supported: true }));

    const regs = await navigator.serviceWorker.getRegistrations();
    if (regs.length === 0) {
      setSw({ supported: true, registered: false, active: false });
      log("warn", "Nessun Service Worker registrato");
      return;
    }

    const reg = regs[0];
    const active = reg.active;
    setSw({
      supported: true,
      registered: true,
      active: !!active,
      scope: reg.scope,
      state: active?.state ?? "installato/in attesa",
    });
    log("ok", `SW trovato — scope: ${reg.scope} — stato: ${active?.state ?? "non attivo"}`);
  }, []);

  // ── Check Permission + Subscription ──────────────────────────────────────

  const checkSub = useCallback(async () => {
    if (!("Notification" in window)) {
      log("warn", "Notification API non supportata");
      return;
    }
    const perm = Notification.permission;
    setSub(prev => ({ ...prev, permission: perm }));
    log("info", `Permesso notifiche: ${perm}`);

    if (perm !== "granted") return;

    if (!("PushManager" in window)) {
      log("warn", "PushManager non supportato");
      return;
    }
    try {
      const reg = await navigator.serviceWorker.ready;
      const existing = await reg.pushManager.getSubscription();
      if (existing) {
        setSub({ permission: perm, subscribed: true, endpoint: existing.endpoint.slice(-40) });
        log("ok", `Subscription attiva: ...${existing.endpoint.slice(-40)}`);
      } else {
        setSub({ permission: perm, subscribed: false });
        log("warn", "Nessuna subscription push attiva nel browser");
      }
    } catch (e) {
      log("error", `Errore lettura subscription: ${e}`);
    }
  }, []);

  // ── Check DB ─────────────────────────────────────────────────────────────

  const checkDb = useCallback(async () => {
    try {
      const res = await fetch("/api/push/debug");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setDb(data);
      log("ok", `DB: ${data.total} subscription/i registrate`);
      data.subscriptions.forEach((s: DbStatus["subscriptions"][0]) =>
        log("info", `  → ${s.user} (${s.role}) — ...${s.endpointShort}`)
      );
    } catch (e) {
      log("error", `Errore lettura DB: ${e}`);
    }
  }, []);

  // ── Subscribe ────────────────────────────────────────────────────────────

  async function handleSubscribe() {
    try {
      log("info", "Richiesta permesso notifiche...");
      const perm = await Notification.requestPermission();
      log(perm === "granted" ? "ok" : "warn", `Permesso: ${perm}`);
      if (perm !== "granted") return;

      log("info", "Attendo Service Worker ready...");
      const reg = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise<never>((_, r) => setTimeout(() => r(new Error("SW timeout 10s")), 10000)),
      ]) as ServiceWorkerRegistration;
      log("ok", "SW ready");

      await reg.update();
      log("info", "SW aggiornato");

      let existing = await reg.pushManager.getSubscription();
      if (existing) {
        log("info", "Subscription già presente nel browser, riuso");
      } else {
        log("info", "Creo nuova subscription push...");
        existing = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_KEY),
        });
        log("ok", `Subscription creata: ...${existing.endpoint.slice(-40)}`);
      }

      log("info", "Salvo subscription nel DB...");
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(existing.toJSON()),
      });
      const body = await res.json();
      if (!res.ok) {
        log("error", `API subscribe fallita: ${JSON.stringify(body)}`);
        return;
      }
      log("ok", "Subscription salvata nel DB ✓");

      await checkSub();
      await checkDb();
    } catch (e) {
      log("error", `handleSubscribe error: ${e}`);
    }
  }

  // ── Unsubscribe ──────────────────────────────────────────────────────────

  async function handleUnsubscribe() {
    try {
      const reg = await navigator.serviceWorker.ready;
      const s = await reg.pushManager.getSubscription();
      if (!s) { log("warn", "Nessuna subscription da rimuovere"); return; }
      await fetch("/api/push/subscribe", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: s.endpoint }),
      });
      await s.unsubscribe();
      log("ok", "Subscription rimossa dal browser e dal DB");
      await checkSub();
      await checkDb();
    } catch (e) {
      log("error", `handleUnsubscribe error: ${e}`);
    }
  }

  // ── Send Test Push ───────────────────────────────────────────────────────

  async function sendTest(target: string) {
    setSending(true);
    log("info", `Invio push di test → target: ${target}`);
    try {
      const res = await fetch("/api/push/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target }),
      });
      const body = await res.json();
      if (!res.ok) {
        log("error", `Push API error: ${JSON.stringify(body)}`);
      } else {
        log("ok", `Push inviato ✓ — aspetta la notifica (max 5-10s)...`);
      }
    } catch (e) {
      log("error", `sendTest error: ${e}`);
    } finally {
      setSending(false);
    }
  }

  // ── Show local notification ──────────────────────────────────────────────

  async function showLocalNotification() {
    if (Notification.permission !== "granted") {
      log("warn", "Permesso non concesso — non posso mostrare notifica locale");
      return;
    }
    const reg = await navigator.serviceWorker.ready;
    await reg.showNotification("🔔 Notifica locale (test SW)", {
      body: "Questa notifica viene mostrata direttamente dal Service Worker senza passare dal server.",
      icon: "/icons/icon-192.png",
      tag: "local-test",
      data: { url: "/dashboard/manager/push-test" },
    });
    log("ok", "Notifica locale inviata tramite SW — deve apparire ora");
  }

  // ── Init ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    checkSW();
    checkSub();
    checkDb();
  }, [checkSW, checkSub, checkDb]);

  // ─── UI ──────────────────────────────────────────────────────────────────

  const Dot = ({ ok, warn }: { ok: boolean; warn?: boolean }) => (
    <span className={`inline-block w-2.5 h-2.5 rounded-full mr-2 ${ok ? "bg-emerald-400" : warn ? "bg-amber-400" : "bg-red-400"}`} />
  );

  const logColor = { info: "text-slate-400", ok: "text-emerald-400", warn: "text-amber-400", error: "text-red-400" } as const;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 font-mono text-sm">
      <div className="max-w-3xl mx-auto space-y-6">

        <div>
          <h1 className="text-xl font-bold text-white">🔔 Push Notification — Test & Diagnosi</h1>
          <p className="text-slate-500 text-xs mt-1">Apri in ogni browser/dispositivo che deve ricevere notifiche</p>
        </div>

        {/* Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* SW */}
          <div className="bg-slate-900 rounded-xl p-4 space-y-1.5">
            <p className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-3">Service Worker</p>
            <p><Dot ok={sw.supported} />Supportato</p>
            <p><Dot ok={sw.registered} />Registrato</p>
            <p><Dot ok={sw.active} />{sw.active ? `Attivo (${sw.state})` : "Non attivo"}</p>
            {sw.scope && <p className="text-slate-600 text-xs pl-5 break-all">{sw.scope}</p>}
          </div>

          {/* Permission + Subscription */}
          <div className="bg-slate-900 rounded-xl p-4 space-y-1.5">
            <p className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-3">Permesso / Subscription</p>
            <p>
              <Dot ok={sub.permission === "granted"} warn={sub.permission === "default"} />
              Permesso: <span className={sub.permission === "granted" ? "text-emerald-400" : sub.permission === "denied" ? "text-red-400" : "text-amber-400"}>{sub.permission}</span>
            </p>
            <p><Dot ok={sub.subscribed} />Subscription attiva</p>
            {sub.endpoint && <p className="text-slate-600 text-xs pl-5 break-all">...{sub.endpoint}</p>}
          </div>

          {/* DB */}
          <div className="bg-slate-900 rounded-xl p-4 space-y-1.5">
            <p className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-3">DB Subscriptions</p>
            <p><Dot ok={(db?.total ?? 0) > 0} />{db ? `${db.total} registrate` : "Caricamento..."}</p>
            {db?.subscriptions.map((s, i) => (
              <p key={i} className="text-slate-500 text-xs pl-5">{s.user} ({s.role})</p>
            ))}
          </div>
        </div>

        {/* VAPID key check */}
        <div className="bg-slate-900 rounded-xl p-4">
          <p className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-2">VAPID Public Key</p>
          {VAPID_KEY
            ? <p className="text-emerald-400 break-all text-xs">✓ Presente: {VAPID_KEY.slice(0, 20)}...</p>
            : <p className="text-red-400 font-bold">✗ MANCANTE — NEXT_PUBLIC_VAPID_PUBLIC_KEY non impostata!</p>
          }
        </div>

        {/* Azioni */}
        <div className="bg-slate-900 rounded-xl p-4 space-y-3">
          <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">Azioni</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <button
              onClick={handleSubscribe}
              className="px-3 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-lg transition-colors"
            >
              ① Registra questo dispositivo
            </button>
            <button
              onClick={handleUnsubscribe}
              className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-lg transition-colors"
            >
              Annulla subscription
            </button>
            <button
              onClick={showLocalNotification}
              className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg transition-colors"
            >
              ② Test locale (solo SW)
            </button>
            <button
              onClick={() => { checkSW(); checkSub(); checkDb(); log("info", "Refresh stato..."); }}
              className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-lg transition-colors"
            >
              Aggiorna stato
            </button>
          </div>

          <p className="text-slate-500 text-xs pt-2">Invia push tramite server (simula evento reale):</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {["self", "MANAGER", "CLEANER", "MAINTENANCE"].map(t => (
              <button
                key={t}
                onClick={() => sendTest(t)}
                disabled={sending}
                className="px-3 py-2 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 text-white text-xs font-bold rounded-lg transition-colors"
              >
                {sending ? "⏳" : "③"} Push → {t === "self" ? "me stesso" : t}
              </button>
            ))}
          </div>
        </div>

        {/* Istruzioni */}
        <div className="bg-slate-900 rounded-xl p-4 text-xs space-y-2 text-slate-400">
          <p className="text-slate-300 font-bold">Come testare:</p>
          <p><span className="text-violet-400">①</span> Clicca <strong>"Registra questo dispositivo"</strong> su ogni browser/telefono che deve ricevere notifiche.</p>
          <p><span className="text-amber-400">②</span> Clicca <strong>"Test locale"</strong> — la notifica deve apparire subito senza passare dal server. Se non appare, il problema è nel Service Worker o nei permessi.</p>
          <p><span className="text-emerald-400">③</span> Clicca <strong>"Push → me stesso"</strong> — passa dal server web-push. Se ② funziona ma ③ no, il problema è nelle VAPID keys o nel server.</p>
          <p><span className="text-slate-500">iOS:</span> Deve essere installata come PWA (Aggiungi a schermata home) e iOS ≥ 16.4.</p>
          <p><span className="text-slate-500">Desktop:</span> Chrome, Edge, Firefox. Safari macOS ≥ 13 con notifiche abilitate.</p>
        </div>

        {/* Log */}
        <div className="bg-black rounded-xl p-4">
          <p className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-3">Log</p>
          <div className="space-y-0.5 max-h-80 overflow-y-auto">
            {logs.length === 0 && <p className="text-slate-600 text-xs">In attesa di eventi...</p>}
            {logs.map((entry, i) => (
              <p key={i} className={`text-xs ${logColor[entry.level]}`}>
                <span className="text-slate-600">[{entry.ts}]</span> {entry.msg}
              </p>
            ))}
          </div>
          {logs.length > 0 && (
            <button onClick={() => setLogs([])} className="mt-3 text-[10px] text-slate-600 hover:text-slate-400">
              Pulisci log
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
