"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";

/**
 * Registra il token push quando l'app gira su nativo:
 * - iOS → token APNs salvato su /api/apns-token
 * - Android → token FCM salvato su /api/fcm-token (richiede google-services.json
 *   nel progetto Android e FIREBASE_SERVICE_ACCOUNT lato server)
 * Va montato una volta nel layout manager/cleaner/maintenance.
 */
export default function ApnsRegister() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const isAndroid = Capacitor.getPlatform() === "android";
    const tokenEndpoint = isAndroid ? "/api/fcm-token" : "/api/apns-token";
    const logTag = isAndroid ? "[FCM]" : "[APNs]";

    function saveDebug(data: object) {
      try { localStorage.setItem("apns_debug", JSON.stringify(data)); } catch (e) { /* ignore */ }
    }

    // Retry per l'errore FCM transitorio SERVICE_NOT_AVAILABLE (tipico subito dopo
    // l'installazione su Android): riproviamo con backoff crescente.
    let attempt = 0;
    const RETRY_DELAYS = [5000, 15000, 30000, 60000];
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    async function register() {
      // Listener PRIMA di register() — senza await per evitare ritardi nella registrazione
      PushNotifications.addListener("registration", async (token) => {
        attempt = 0; // successo: azzera i retry
        console.log(`${logTag} Token ricevuto:`, token.value.slice(-20));
        saveDebug({ ts: new Date().toISOString(), status: "token_received", tokenShort: token.value.slice(-20) });
        try {
          const res = await fetch(tokenEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: token.value }),
          });
          console.log(`${logTag} Token salvato, status:`, res.status);
          saveDebug({ ts: new Date().toISOString(), status: "token_saved", httpStatus: res.status, tokenShort: token.value.slice(-20) });
        } catch (e) {
          console.error(`${logTag} Errore salvataggio token:`, e);
          saveDebug({ ts: new Date().toISOString(), status: "save_error", error: String(e) });
        }
      });

      PushNotifications.addListener("registrationError", (err) => {
        console.error(`${logTag} Registrazione fallita:`, JSON.stringify(err));
        saveDebug({ ts: new Date().toISOString(), status: "registration_error", error: JSON.stringify(err), attempt });
        // Riprova: SERVICE_NOT_AVAILABLE è quasi sempre transitorio
        if (attempt < RETRY_DELAYS.length) {
          const delay = RETRY_DELAYS[attempt];
          attempt++;
          console.log(`${logTag} Riprovo la registrazione tra ${delay / 1000}s (tentativo ${attempt})`);
          retryTimer = setTimeout(() => { PushNotifications.register().catch(console.error); }, delay);
        }
      });

      PushNotifications.addListener("pushNotificationReceived", (notification) => {
        console.log(`${logTag} Notifica ricevuta:`, notification);
      });

      PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
        const url = action.notification.data?.url;
        PushNotifications.removeAllDeliveredNotifications().catch(() => {});
        if (url) window.location.href = url;
      });

      // Azzera badge e notifiche nel cassetto quando l'utente torna in app
      const onVisible = () => {
        if (document.visibilityState === "visible") {
          PushNotifications.removeAllDeliveredNotifications().catch(() => {});
          fetch("/api/push/clear-badge", { method: "POST" }).catch(() => {});
        }
      };
      document.addEventListener("visibilitychange", onVisible);

      // Android: crea il canale "default" — senza un canale esistente Android 8+
      // scarta le notifiche (in background non appaiono). Deve combaciare con il
      // channelId usato nel payload FCM lato server (src/lib/fcm.ts).
      if (isAndroid) {
        try {
          await PushNotifications.createChannel({
            id: "propops_v2",
            name: "Notifiche",
            description: "Avvisi messaggi e attività",
            importance: 5,
            visibility: 1,
            sound: "default",
          });
        } catch (e) {
          console.warn(`${logTag} createChannel fallito:`, e);
        }
      }

      // Chiedi permesso
      const permission = await PushNotifications.requestPermissions();
      console.log(`${logTag} Permesso:`, permission.receive);
      saveDebug({ ts: new Date().toISOString(), status: "permission_result", receive: permission.receive });
      if (permission.receive !== "granted") return;

      // Registra — il token arriverà nel listener sopra
      await PushNotifications.register();
      console.log(`${logTag} register() chiamato`);
    }

    register().catch(console.error);

    return () => { if (retryTimer) clearTimeout(retryTimer); };
  }, []);

  return null;
}
