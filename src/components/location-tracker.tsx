"use client";

import { useEffect, useRef } from "react";
import { Capacitor } from "@capacitor/core";
import { Geolocation } from "@capacitor/geolocation";

const INTERVAL_MS = 30_000;

export default function LocationTracker() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasPermission = useRef(false);

  async function requestPermission(): Promise<boolean> {
    try {
      if (Capacitor.isNativePlatform()) {
        const perm = await Geolocation.requestPermissions();
        return perm.location === "granted" || perm.coarseLocation === "granted";
      } else {
        // Browser: prova direttamente, il browser mostra il dialog
        return new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            () => resolve(true),
            () => resolve(false),
            { timeout: 5000 }
          );
        });
      }
    } catch {
      return false;
    }
  }

  async function sendLocation() {
    try {
      let lat: number, lng: number, acc: number | undefined;

      if (Capacitor.isNativePlatform()) {
        const pos = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000,
        });
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
        acc = pos.coords.accuracy;
      } else {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false, // false = più veloce su browser
            timeout: 10000,
            maximumAge: 60000,
          })
        );
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
        acc = pos.coords.accuracy;
      }

      const res = await fetch("/api/location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude: lat, longitude: lng, accuracy: acc }),
      });

      if (!res.ok) {
        console.warn("[LocationTracker] API error:", res.status);
      } else {
        console.log("[LocationTracker] Posizione inviata:", lat, lng);
      }
    } catch (err) {
      console.warn("[LocationTracker] GPS non disponibile:", err);
    }
  }

  useEffect(() => {
    if (!("geolocation" in navigator) && !Capacitor.isNativePlatform()) {
      console.warn("[LocationTracker] Geolocalizzazione non supportata");
      return;
    }

    // Richiedi permesso poi avvia il tracking
    requestPermission().then((granted) => {
      if (!granted) {
        console.warn("[LocationTracker] Permesso GPS negato");
        return;
      }
      hasPermission.current = true;
      sendLocation(); // Prima lettura immediata
      intervalRef.current = setInterval(sendLocation, INTERVAL_MS);
    });

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      // Rimuovi posizione quando il cleaner lascia la dashboard
      fetch("/api/location", { method: "DELETE" }).catch(() => {});
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
