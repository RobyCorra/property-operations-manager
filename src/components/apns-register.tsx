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

    async function register() {
      // Chiedi permesso
      const permission = await PushNotifications.requestPermissions();
      if (permission.receive !== "granted") return;

      // Registra con APNs
      await PushNotifications.register();

      // Ascolta il token
      PushNotifications.addListener("registration", async (token) => {
        try {
          await fetch("/api/apns-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: token.value }),
          });
          console.log("[APNs] Token registrato:", token.value);
        } catch (e) {
          console.error("[APNs] Errore registrazione token:", e);
        }
      });

      PushNotifications.addListener("registrationError", (err) => {
        console.error("[APNs] Registrazione fallita:", err);
      });

      // Gestisci notifica ricevuta con app aperta
      PushNotifications.addListener("pushNotificationReceived", (notification) => {
        console.log("[APNs] Notifica ricevuta:", notification);
      });

      // Gestisci tap su notifica
      PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
        const url = action.notification.data?.url;
        if (url) window.location.href = url;
      });
    }

    register().catch(console.error);
  }, []);

  return null;
}
