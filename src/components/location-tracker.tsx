"use client";

import { useEffect, useRef } from "react";
import { Capacitor } from "@capacitor/core";
import { Geolocation } from "@capacitor/geolocation";

const INTERVAL_MS = 30_000; // 30 secondi

/**
 * Invia la posizione GPS del cleaner/manutentore al server ogni 30s.
 * Funziona sia su app nativa (Capacitor) che su browser (API Web).
 * Va montato nel layout del cleaner/manutentore.
 */
export default function LocationTracker() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function sendLocation() {
    try {
      let lat: number, lng: number, acc: number | undefined;

      if (Capacitor.isNativePlatform()) {
        const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
        acc = pos.coords.accuracy;
      } else {
        // Fallback browser
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000 })
        );
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
        acc = pos.coords.accuracy;
      }

      await fetch("/api/location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude: lat, longitude: lng, accuracy: acc }),
      });
    } catch (err) {
      // GPS non disponibile o permesso negato — ignora silenziosamente
      console.warn("[LocationTracker] GPS non disponibile:", err);
    }
  }

  useEffect(() => {
    // Prima lettura immediata
    sendLocation();

    // Poi ogni 30s
    intervalRef.current = setInterval(sendLocation, INTERVAL_MS);

    // Cleanup: rimuovi posizione quando l'utente lascia la pagina
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      fetch("/api/location", { method: "DELETE" }).catch(() => {});
    };
  }, []);

  return null;
}
