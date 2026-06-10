"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { ApartmentStatus } from "@/src/lib/apartment-status";

interface ApartmentMapProps {
  apartments: Array<{
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    status: ApartmentStatus;
    openTickets: number;
    nextCheckIn?: { checkInDate: Date | string; guestName: string };
  }>;
}

export interface CleanerMarker {
  userId: string;
  name: string;
  role: string;
  latitude: number;
  longitude: number;
  updatedAt: string;
}

const ApartmentMap = dynamic(() => import("./apartment-map"), {
  ssr: false,
  loading: () => <div className="h-[400px] w-full bg-gray-100 animate-pulse rounded-2xl border border-gray-200 flex items-center justify-center text-gray-400">Caricamento mappa...</div>
});

export default function ApartmentMapWrapper(props: ApartmentMapProps) {
  const [cleaners, setCleaners] = useState<CleanerMarker[]>([]);

  useEffect(() => {
    async function fetchLocations() {
      try {
        const res = await fetch("/api/location");
        if (!res.ok) return;
        const data = await res.json();
        setCleaners(data.map((loc: { user: { id: string; name: string; role: string }; latitude: number; longitude: number; updatedAt: string }) => ({
          userId: loc.user.id,
          name: loc.user.name,
          role: loc.user.role,
          latitude: loc.latitude,
          longitude: loc.longitude,
          updatedAt: loc.updatedAt,
        })));
      } catch {
        // silenzioso
      }
    }

    fetchLocations();
    const interval = setInterval(fetchLocations, 30_000);
    return () => clearInterval(interval);
  }, []);

  return <ApartmentMap {...props} cleaners={cleaners} />;
}
