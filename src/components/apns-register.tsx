"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";

/**
 * Registra il token APNs quando l'app gira su iOS nativo.
 * Va montato una volta nel layout manager/cleaner/maintenance.
 */
export default function ApnsRegister() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    // Firebase non è configurato su Android — le push notification funzionano solo su iOS
    if (Capacitor.getPlatform() === "android") return;

    function saveDebug(data: object) {
      try { localStorage.setItem("apns_debug", JSON.stringify(data)); } catch (e) { /* ignore */ }
    }

    async function register() {
      // Listener PRIMA di register() — senza await per evitare ritardi nella registrazione
      PushNotifications.addListener("registration", async (token) => {
        console.log("[APNs] Token ricevuto:", token.value.slice(-20));
        saveDebug({ ts: new Date().toISOString(), status: "token_received", tokenShort: token.value.slice(-20) });
        try {
          const res = await fetch("/api/apns-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: token.value }),
          });
          console.log("[APNs] Token salvato, status:", res.status);
          saveDebug({ ts: new Date().toISOString(), status: "token_saved", httpStatus: res.status, tokenShort: token.value.slice(-20) });
        } catch (e) {
          console.error("[APNs] Errore salvataggio token:", e);
          saveDebug({ ts: new Date().toISOString(), status: "save_error", error: String(e) });
        }
      });

      PushNotifications.addListener("registrationError", (err) => {
        console.error("[APNs] Registrazione fallita:", JSON.stringify(err));
        saveDebug({ ts: new Date().toISOString(), status: "registration_error", error: JSON.stringify(err) });
      });

      PushNotifications.addListener("pushNotificationReceived", (notification) => {
        console.log("[APNs] Notifica ricevuta:", notification);
      });

      PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
        const url = action.notification.data?.url;
        if (url) window.location.href = url;
      });

      // Chiedi permesso
      const permission = await PushNotifications.requestPermissions();
      console.log("[APNs] Permesso:", permission.receive);
      saveDebug({ ts: new Date().toISOString(), status: "permission_result", receive: permission.receive });
      if (permission.receive !== "granted") return;

      // Registra con APNs — il token arriverà nel listener sopra
      await PushNotifications.register();
      console.log("[APNs] register() chiamato");
    }

    register().catch(console.error);
  }, []);

  return null;
}
