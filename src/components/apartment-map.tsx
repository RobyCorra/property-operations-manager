"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { ApartmentStatus, APARTMENT_STATUS_META } from "@/src/lib/apartment-status";
import type { CleanerMarker } from "./apartment-map-wrapper";

// Fix Leaflet's default icon paths just in case, though we use custom icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

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
  cleaners?: CleanerMarker[];
}

const createCleanerIcon = (role: string) => {
  const color = role === "MAINTENANCE" ? "#F59E0B" : "#6366F1";
  const emoji = role === "MAINTENANCE" ? "🔧" : "🧹";
  const html = `
    <div style="
      background: ${color};
      width: 2rem; height: 2rem;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      border: 2.5px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.25);
      font-size: 14px;
      position: relative;
    ">
      ${emoji}
      <span style="
        position: absolute; bottom: -2px; right: -2px;
        width: 10px; height: 10px;
        background: #22C55E;
        border-radius: 50%;
        border: 1.5px solid white;
      "></span>
    </div>`;
  return L.divIcon({ className: "cleaner-marker", html, iconSize: [32, 32], iconAnchor: [16, 16] });
};

// Generate colored HTML pin markers
const createPinIcon = (colorHex: string) => {
  const html = `
    <div style="
      background-color: ${colorHex};
      width: 1.5rem;
      height: 1.5rem;
      display: block;
      left: -0.75rem;
      top: -0.75rem;
      position: relative;
      border-radius: 3rem 3rem 0;
      transform: rotate(45deg);
      border: 1px solid #FFFFFF;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    "></div>
  `;
  
  return L.divIcon({
    className: "custom-pin",
    html: html,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
  });
};

// Using centralized APARTMENT_STATUS_META for colors and labels

// Component to adjust bounds to fit all markers
function MapBounds({ apartments }: { apartments: ApartmentMapProps["apartments"] }) {
  const map = useMap();
  useEffect(() => {
    if (apartments.length > 0) {
      const bounds = L.latLngBounds(apartments.map((a) => [a.latitude, a.longitude]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, apartments]);
  return null;
}

export default function ApartmentMap({ apartments, cleaners = [] }: ApartmentMapProps) {
  // Prevent hydration styling mismatch by returning null until client is mounted
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="h-[400px] w-full bg-gray-100 animate-pulse rounded-2xl border border-gray-200 flex items-center justify-center text-gray-400">Caricamento mappa...</div>;
  }

  const defaultCenter: [number, number] = apartments.length > 0 
    ? [apartments[0].latitude, apartments[0].longitude] 
    : [41.9028, 12.4964]; // default Rome

  return (
    <div className="h-[400px] w-full rounded-2xl overflow-hidden shadow-sm border border-gray-100 z-0 relative">
      <MapContainer 
        center={defaultCenter} 
        zoom={apartments.length > 0 ? 13 : 5} 
        scrollWheelZoom={false} 
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapBounds apartments={apartments} />

        {/* Marker cleaner/manutentori in tempo reale */}
        {cleaners.map((c) => (
          <Marker key={c.userId} position={[c.latitude, c.longitude]} icon={createCleanerIcon(c.role)}>
            <Popup className="rounded-xl overflow-hidden p-0 border-none">
              <div className="flex flex-col gap-1 w-44 font-sans p-1">
                <p className="font-semibold text-slate-900 text-sm">{c.name}</p>
                <p className="text-xs text-slate-500">{c.role === "MAINTENANCE" ? "Manutentore" : "Cleaner"}</p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Aggiornato: {new Date(c.updatedAt).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}

        {apartments.map((apt) => (
          <Marker 
            key={apt.id} 
            position={[apt.latitude, apt.longitude]}
            icon={createPinIcon(APARTMENT_STATUS_META[apt.status].hex)}
          >
            <Popup className="rounded-xl overflow-hidden p-0 border-none">
              <div className="flex flex-col gap-1 w-48 font-sans">
                <h3 className="font-semibold text-gray-900 text-base leading-tight mt-1">{apt.name}</h3>
                <p className="text-xs text-gray-500 truncate mb-1">{apt.address}</p>
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: APARTMENT_STATUS_META[apt.status].hex }}></div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-700">{APARTMENT_STATUS_META[apt.status].label}</span>
                </div>
                <div className="text-xs text-gray-600 mt-1 flex flex-col gap-1">
                  <div>
                    <span className="text-gray-400">Ticket Aperti:</span> <strong className={apt.openTickets > 0 ? "text-red-600" : "text-gray-700"}>{apt.openTickets}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400">Prossimo Check-in:</span>{" "}
                    <strong className="text-gray-700">
                      {apt.nextCheckIn ? new Date(apt.nextCheckIn.checkInDate).toLocaleDateString("it-IT") : "Nessuno"}
                    </strong>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
