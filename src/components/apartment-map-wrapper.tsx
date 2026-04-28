"use client";

import dynamic from "next/dynamic";
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

// Dynamically import the map avoiding SSR
const ApartmentMap = dynamic(() => import("./apartment-map"), { 
    ssr: false,
    loading: () => <div className="h-[400px] w-full bg-gray-100 animate-pulse rounded-2xl border border-gray-200 flex items-center justify-center text-gray-400">Caricamento mappa...</div>
});

export default function ApartmentMapWrapper(props: ApartmentMapProps) {
  return <ApartmentMap {...props} />;
}
