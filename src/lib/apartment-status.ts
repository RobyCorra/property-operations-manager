import { MaintenanceTicket, CleaningTask, Booking } from "@prisma/client";

export type ApartmentStatusColor = "GREEN" | "BLUE" | "RED";

export interface ApartmentStatusResult {
  status: "ready" | "not_ready" | "occupied";
  available: boolean;
  color: ApartmentStatusColor;
  label: "Pronto" | "Non pronto" | "Occupato";
  reason: "urgent_ticket" | "cleaning_pending" | "cleaning_completed" | "occupied_after_15" | "ready";
}

export const STATUS_UI: Record<ApartmentStatusColor, { label: string; tailwind: string; hex: string }> = {
  GREEN: {
    label: "Pronto",
    tailwind: "bg-emerald-100 text-emerald-800 border-emerald-200",
    hex: "#10b981",
  },
  BLUE: {
    label: "Non pronto",
    tailwind: "bg-blue-100 text-blue-800 border-blue-200",
    hex: "#3b82f6",
  },
  RED: {
    label: "Occupato",
    tailwind: "bg-red-100 text-red-800 border-red-200",
    hex: "#ef4444",
  }
};

/**
 * Normalizes a date to YYYY-MM-DD string in Europe/Madrid timezone
 */
export function formatDateKey(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return "INVALID_DATE";
  
  const parts = new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Europe/Madrid'
  }).formatToParts(d);
  
  const year = parts.find(p => p.type === 'year')?.value;
  const month = parts.find(p => p.type === 'month')?.value;
  const day = parts.find(p => p.type === 'day')?.value;
  
  return `${year}-${month}-${day}`;
}

/**
 * Gets current hour in Europe/Madrid timezone
 */
export function getMadridHour(now: Date = new Date()): number {
  return parseInt(new Intl.DateTimeFormat('en-GB', {
    hour: 'numeric',
    hour12: false,
    timeZone: 'Europe/Madrid'
  }).format(now));
}

/**
 * The Definitive Status Engine
 */
export function getApartmentOperationalStatus(
  targetDate: Date | string,
  bookings: Booking[],
  cleanings: CleaningTask[],
  tickets: MaintenanceTicket[],
  options: { now?: Date; apartmentId?: string; debug?: boolean } = {}
): ApartmentStatusResult {

  const now = options.now || new Date();
  const dateKey = formatDateKey(targetDate);
  const todayKey = formatDateKey(now);
  const isToday = dateKey === todayKey;

  // --- 1. DATI DI BASE ---
  const relevantBooking = bookings.find(b => {
    if (b.status === "CANCELLED") return false;
    const start = formatDateKey(b.checkInDate);
    const end = formatDateKey(b.checkOutDate);
    return dateKey >= start && dateKey < end;
  });

  const isCheckInDay = relevantBooking && formatDateKey(relevantBooking.checkInDate) === dateKey;
  const isOngoingStay = relevantBooking && formatDateKey(relevantBooking.checkInDate) < todayKey;
  
  const pendingCleaning = cleanings.find(c => {
    if (c.status === "CANCELLED" || c.status === "COMPLETED") return false;
    const cleanDateKey = formatDateKey(c.date);
    return (c.status === "PENDING" || c.status === "IN_PROGRESS") && cleanDateKey <= dateKey;
  });

  const openUrgentTicket = tickets.find(t => {
    if (t.status === "CANCELLED" || t.status === "RESOLVED") return false;
    return (t.status === "OPEN" || t.status === "IN_PROGRESS") && t.priority === "URGENT";
  });

  // --- 2. GERARCHIA DI STATO (STRETTA) ---

  // PRIORITÀ 1: OCCUPATO (RED)
  // Soggiorno in corso oggi OR (Check-in oggi dopo le 15:00)
  const isOccupiedNow = (isOngoingStay && isToday) || (isCheckInDay && isToday && getMadridHour(now) >= 15);
  
  if (isOccupiedNow) {
    return {
      status: "occupied",
      available: false,
      color: "RED",
      label: "Occupato",
      reason: "occupied_after_15"
    };
  }

  // PRIORITÀ 2: NON PRONTO (BLUE)
  // Pulizia da fare OPPURE Ticket manutenzione urgente aperto
  if (pendingCleaning || openUrgentTicket) {
    return {
      status: "not_ready",
      available: false,
      color: "BLUE",
      label: "Non pronto",
      reason: openUrgentTicket ? "urgent_ticket" : "cleaning_pending"
    };
  }

  // PRIORITÀ 3: PRONTO (GREEN)
  // Tutto il resto
  return {
    status: "ready",
    available: true,
    color: "GREEN",
    label: "Pronto",
    reason: "ready"
  };
}

/**
 * UI Metadata helper
 */
export type ApartmentStatus = ApartmentStatusColor;
export const APARTMENT_STATUS_META = {
    GREEN: { label: "Pronto", tailwind: STATUS_UI.GREEN.tailwind, hex: STATUS_UI.GREEN.hex },
    BLUE: { label: "Non pronto", tailwind: STATUS_UI.BLUE.tailwind, hex: STATUS_UI.BLUE.hex },
    RED: { label: "Occupato", tailwind: STATUS_UI.RED.tailwind, hex: STATUS_UI.RED.hex }
} as any;

export function getTodayUTC(): Date {
  const d = new Date();
  d.setUTCHours(0,0,0,0);
  return d;
}

export function isMaintenanceActive(status: string): boolean {
    const s = status.toUpperCase();
    return s === "OPEN" || s === "IN_PROGRESS";
}

// Deprecated signature for compatibility
export function getApartmentStatus(
  tickets: MaintenanceTicket[],
  cleanings: CleaningTask[],
  bookings: Booking[]
): ApartmentStatus {
  const res = getApartmentOperationalStatus(new Date(), bookings, cleanings, tickets);
  return res.color;
}
