import { prisma } from "../prisma";
import { syncCleaningTaskFromBooking } from "@/src/app/actions/operational";
import { syncCheckinTaskFromBooking } from "@/src/app/actions/checkin";

// ── Minimal iCal parser (no external deps) ────────────────────────────────────
type ICalEvent = {
  uid: string;
  summary: string;
  start: Date;
  end: Date;
};

function parseICalDate(value: string): Date {
  // Formats: 20260629, 20260629T140000Z, 20260629T140000
  const clean = value.replace(/[TZ]/g, "");
  const year = parseInt(clean.slice(0, 4));
  const month = parseInt(clean.slice(4, 6)) - 1;
  const day = parseInt(clean.slice(6, 8));
  return new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
}

function parseICS(text: string): ICalEvent[] {
  const events: ICalEvent[] = [];
  // Unfold lines (RFC 5545: continuation lines start with space/tab)
  const unfolded = text.replace(/\r?\n[ \t]/g, "");
  const lines = unfolded.split(/\r?\n/);

  let inEvent = false;
  let current: Partial<ICalEvent> = {};

  for (const raw of lines) {
    const line = raw.trim();
    if (line === "BEGIN:VEVENT") { inEvent = true; current = {}; continue; }
    if (line === "END:VEVENT") {
      if (inEvent && current.uid && current.start && current.end) {
        events.push(current as ICalEvent);
      }
      inEvent = false;
      continue;
    }
    if (!inEvent) continue;

    // Key may have parameters: DTSTART;TZID=Europe/Rome:20260629T140000
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;
    const keyPart = line.slice(0, colonIdx).split(";")[0].toUpperCase();
    const value = line.slice(colonIdx + 1).trim();

    if (keyPart === "UID") current.uid = value;
    else if (keyPart === "SUMMARY") current.summary = value;
    else if (keyPart === "DTSTART") current.start = parseICalDate(value);
    else if (keyPart === "DTEND") current.end = parseICalDate(value);
  }

  return events;
}
// ─────────────────────────────────────────────────────────────────────────────

export async function performApartmentIcalSync(apartmentId: string) {
  const apartment = await prisma.apartment.findUnique({
    where: { id: apartmentId },
    select: { id: true, name: true, icalUrl: true }
  });

  if (!apartment || !apartment.icalUrl) {
    throw new Error("Appartamento non trovato o URL iCal mancante.");
  }

  // 1. Fetch iCal data
  const response = await fetch(apartment.icalUrl);
  if (!response.ok) {
    throw new Error(`Impossibile scaricare iCal: ${response.statusText}`);
  }
  const icalData = await response.text();

  // 2. Parse
  const events = parseICS(icalData);
  const activeExternalIds: string[] = [];

  for (const event of events) {
    // Skip blocking events
    const summary = (event.summary || "").toLowerCase();
    if (
      summary.includes("not available") ||
      summary.includes("non disponibile") ||
      summary.includes("closed") ||
      summary.includes("blocked") ||
      summary.includes("unavailable")
    ) continue;

    const externalId = event.uid;
    activeExternalIds.push(externalId);

    const checkInDate = event.start;
    const checkOutDate = event.end;

    // 3. Upsert Booking
    const booking = await prisma.booking.upsert({
      where: { externalId },
      update: { checkInDate, checkOutDate, status: "ACTIVE" },
      create: {
        externalId,
        apartmentId: apartment.id,
        guestName: "Prenotazione Airbnb",
        totalGuests: 1,
        checkInDate,
        checkOutDate,
        source: "airbnb",
        status: "ACTIVE",
      },
    });

    // 4. Sync cleaning task + check-in task
    await syncCleaningTaskFromBooking(booking.id);
    await syncCheckinTaskFromBooking(booking.id);
  }

  // 5. Cancel removed bookings.
  // Airbnb esporta nel feed iCal solo le prenotazioni in corso e future: quelle
  // già concluse spariscono dal feed col tempo, ma NON sono annullamenti. Se le
  // marcassimo CANCELLED sparirebbero dallo storico del calendario. Quindi
  // consideriamo "annullata" solo una prenotazione ancora in corso o futura che
  // esce dal feed; le passate restano ACTIVE.
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const missingBookings = await prisma.booking.findMany({
    where: {
      apartmentId: apartment.id,
      source: "airbnb",
      status: "ACTIVE",
      checkOutDate: { gte: startOfToday },
      NOT: { externalId: { in: activeExternalIds } },
    },
  });

  for (const b of missingBookings) {
    await prisma.booking.update({ where: { id: b.id }, data: { status: "CANCELLED" } });
    await syncCleaningTaskFromBooking(b.id);
    await syncCheckinTaskFromBooking(b.id);
  }

  // 6. Update lastSyncAt
  await prisma.apartment.update({ where: { id: apartment.id }, data: { lastSyncAt: new Date() } });

  return activeExternalIds.length;
}

export async function performAllApartmentsIcalSync() {
  const apartments = await prisma.apartment.findMany({
    where: { AND: [{ icalUrl: { not: null } }, { icalUrl: { not: "" } }] },
    select: { id: true },
  });

  const results = [];
  for (const apartment of apartments) {
    try {
      const count = await performApartmentIcalSync(apartment.id);
      results.push({ id: apartment.id, success: true, count });
    } catch (error: any) {
      results.push({ id: apartment.id, success: false, error: error.message });
    }
  }
  return results;
}
