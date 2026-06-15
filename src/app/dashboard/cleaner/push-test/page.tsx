"use client";

import { useEffect, useState, useCallback } from "react";
import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";

function now() {
  return new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

interface LogEntry { ts: string; level: "info" | "ok" | "warn" | "error"; msg: string; }

export default function CleanerPushTestPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isNative, setIsNative] = useState(false);
  const [apnsTokenInDb, setApnsTokenInDb] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  function log(level: LogEntry["level"], msg: string) {
    setLogs(prev => [{ ts: now(), level, msg }, ...prev].slice(0, 80));
  }

  const checkAll = useCallback(async () => {
    log("info", "── Controllo stato ──");

    const native = Capacitor.isNativePlatform();
    const platform = Capacitor.getPlatform();
    setIsNative(native);
    log("info", `Piattaforma: ${platform} — nativo: ${native ? "sì" : "no"}`);

    if (native) {
      // Controlla se il plugin è disponibile
      const pluginAvailable = Capacitor.isPluginAvailable("PushNotifications");
      log(pluginAvailable ? "ok" : "error", `Plugin PushNotifications disponibile: ${pluginAvailable ? "SÌ" : "NO"}`);

      // Controlla permessi attuali (senza richiederli)
      try {
        const perm = await PushNotifications.checkPermissions();
        log(perm.receive === "granted" ? "ok" : "warn", `Permesso attuale: ${perm.receive}`);
      } catch (e) {
        log("error", `Errore checkPermissions: ${e}`);
      }

      // Leggi debug da localStorage
      try {
        const debug = localStorage.getItem("apns_debug");
        if (debug) {
          log("info", `LocalStorage apns_debug: ${debug}`);
        } else {
          log("warn", "Nessun log APNs in localStorage (ApnsRegister non ha ancora scritto)");
        }
      } catch (e) { /* ignore */ }
    }

    // Controlla token APNs nel DB
    try {
      const res = await fetch("/api/apns-token/status");
      if (res.ok) {
        const data = await res.json();
        setApnsTokenInDb(data.hasToken);
        log(data.hasToken ? "ok" : "warn",
          data.hasToken
            ? `Token APNs nel DB: ...${data.tokenShort}`
            : "Nessun token APNs nel DB");
      } else if (res.status === 401) {
        log("error", "Non autenticato — cookie userId mancante");
      } else {
        log("warn", `Errore API status: ${res.status}`);
      }
    } catch (e) {
      log("error", `Errore verifica DB: ${e}`);
    }
  }, []);

  useEffect(() => { checkAll(); }, [checkAll]);

  async function handleRegisterApns() {
    setBusy(true);
    try {
      log("info", "── Registrazione APNs manuale ──");

      // 1) Attacca listener PRIMA di register()
      log("info", "Attacco listener registration/registrationError...");
      let resolved = false;

      const registrationHandle = await PushNotifications.addListener("registration", async (token) => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timer);
        log("ok", `Token APNs ricevuto: ...${token.value.slice(-20)}`);
        try {
          localStorage.setItem("apns_debug", JSON.stringify({ ts: now(), status: "token_received", tokenShort: token.value.slice(-20) }));
        } catch (e) { /* ignore */ }
        try {
          const res = await fetch("/api/apns-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: token.value }),
          });
          if (res.ok) {
            log("ok", "Token salvato nel DB ✓");
            setApnsTokenInDb(true);
          } else {
            const body = await res.text();
            log("error", `Errore salvataggio token: ${res.status} — ${body}`);
          }
        } catch (e) {
          log("error", `Errore salvataggio: ${e}`);
        }
        setBusy(false);
      });

      const errorHandle = await PushNotifications.addListener("registrationError", (err) => {
        if (resolved) return;
        resolved = true;
        clearTimeout(timer);
        const msg = JSON.stringify(err);
        log("error", `Registrazione APNs FALLITA: ${msg}`);
        try {
          localStorage.setItem("apns_debug", JSON.stringify({ ts: now(), status: "error", error: msg }));
        } catch (e) { /* ignore */ }
        setBusy(false);
      });

      log("ok", "Listener attaccati");

      // 2) Richiedi permesso
      log("info", "Richiedo permesso...");
      const perm = await PushNotifications.requestPermissions();
      log(perm.receive === "granted" ? "ok" : "error", `Permesso: ${perm.receive}`);

      if (perm.receive !== "granted") {
        log("warn", "Permesso negato — impossibile registrare");
        setBusy(false);
        return;
      }

      // 3) Chiama register()
      log("info", "Chiamo PushNotifications.register()...");
      await PushNotifications.register();
      log("info", "register() inviato — aspetto token (max 15s)...");

      // Timeout
      const timer = setTimeout(() => {
        if (resolved) return;
        resolved = true;
        log("warn", "TIMEOUT 15s — nessun token e nessun errore ricevuto");
        log("warn", "Il bridge Capacitor non ha risposto a register()");
        try {
          localStorage.setItem("apns_debug", JSON.stringify({ ts: now(), status: "timeout" }));
        } catch (e) { /* ignore */ }
        setBusy(false);
      }, 15000);

    } catch (e) {
      log("error", `Errore inatteso: ${e}`);
      setBusy(false);
    }
  }

  async function handleTestApns() {
    setBusy(true);
    log("info", "Invio push APNs di test dal server...");
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
        log("ok", "Push APNs inviata — aspetta 5-10s (app in background)");
      }
    } catch (e) {
      log("error", `Errore: ${e}`);
    }
    setBusy(false);
  }

  function handleClearStorage() {
    try { localStorage.removeItem("apns_debug"); } catch (e) { /* ignore */ }
    log("info", "localStorage apns_debug rimosso");
  }

  const Dot = ({ ok, warn }: { ok: boolean; warn?: boolean }) => (
    <span className={`inline-block w-2.5 h-2.5 rounded-full mr-2 shrink-0 ${ok ? "bg-emerald-400" : warn ? "bg-amber-400" : "bg-red-400"}`} />
  );

  const logColor = { info: "text-slate-400", ok: "text-emerald-400", warn: "text-amber-400", error: "text-red-400" } as const;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 font-mono text-sm">
      <div className="max-w-xl mx-auto space-y-5">

        <div>
          <h1 className="text-lg font-bold">🔔 Push Test — APNs</h1>
          <p className="text-slate-500 text-xs mt-1">Diagnostica notifiche Capacitor iOS</p>
        </div>

        {/* Stato */}
        <div className="bg-slate-900 rounded-xl p-4 space-y-2">
          <p className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-3">Stato</p>
          <p className="flex items-center"><Dot ok={isNative} />App nativa (Capacitor)</p>
          <p className="flex items-center">
            <Dot ok={apnsTokenInDb === true} warn={apnsTokenInDb === null} />
            {apnsTokenInDb === null ? "Token APNs: verifica..." :
             apnsTokenInDb ? "Token APNs nel DB ✓" : "Token APNs NON nel DB ✗"}
          </p>
        </div>

        {/* Azioni */}
        <div className="bg-slate-900 rounded-xl p-4 space-y-3">
          <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">Azioni</p>
          <button onClick={handleRegisterApns} disabled={busy || !isNative}
            className="w-full py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-colors">
            {busy ? "⏳ Attendi..." : "① Registra APNs"}
          </button>
          <button onClick={handleTestApns} disabled={busy || !apnsTokenInDb}
            className="w-full py-3 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-colors">
            ② Invia push di test
          </button>
          <div className="flex gap-2">
            <button onClick={checkAll} disabled={busy}
              className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-colors">
              Aggiorna stato
            </button>
            <button onClick={handleClearStorage}
              className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-bold rounded-xl transition-colors">
              Pulisci cache
            </button>
          </div>
        </div>

        {/* Log */}
        <div className="bg-black rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">Log</p>
            {logs.length > 0 && (
              <button onClick={() => setLogs([])} className="text-[10px] text-slate-600 hover:text-slate-400">Pulisci</button>
            )}
          </div>
          <div className="space-y-0.5 max-h-96 overflow-y-auto">
            {logs.length === 0 && <p className="text-slate-600 text-xs">In attesa...</p>}
            {logs.map((e, i) => (
              <p key={i} className={`text-xs ${logColor[e.level]}`}>
                <span className="text-slate-600">[{e.ts}]</span> {e.msg}
              </p>
            ))}
          </div>
        </div>

        <p className="text-slate-700 text-[10px] text-center">v2 — listeners prima di register()</p>
      </div>
    </div>
  );
}
