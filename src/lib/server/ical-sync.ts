import { prisma } from "../prisma";
import { syncCleaningTaskFromBooking } from "@/src/app/actions/operational";

/**
 * Server-only service for iCal synchronization.
 * This file is the ONLY one allowed to import 'node-ical' to prevent 
 * bundling issues in Next.js Server Actions.
 */

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

  // 2. Parse iCal
  const ical = (await import("node-ical")).default;
  const events = ical.parseICS(icalData);
  const activeExternalIds: string[] = [];

  for (const k in events) {
    const event = events[k];
    if (!event || event.type !== 'VEVENT' || !event.start || !event.end || !event.uid) continue;

    const externalId = event.uid;
    activeExternalIds.push(externalId);

    // Extract components as they appear in the source date (treating it as a "clock date")
    // to avoid timezone shifts when normalizing to UTC midnight.
    const start = event.start as Date;
    const end = event.end as Date;

    const checkInDate = new Date(Date.UTC(
      start.getFullYear(),
      start.getMonth(),
      start.getDate(),
      0, 0, 0, 0
    ));

    const checkOutDate = new Date(Date.UTC(
      end.getFullYear(),
      end.getMonth(),
      end.getDate(),
      0, 0, 0, 0
    ));

    const guestName = "Prenotazione Airbnb";
    const totalGuests = 1;

    // 3. Upsert Booking
    await prisma.booking.upsert({
      where: { externalId },
      update: {
        checkInDate,
        checkOutDate,
        status: "ACTIVE",
      },
      create: {
        externalId,
        apartmentId: apartment.id,
        guestName,
        totalGuests,
        checkInDate,
        checkOutDate,
        source: "airbnb",
        status: "ACTIVE",
      },
    });

    // 3. Sync cleaning task for this booking
    await syncCleaningTaskFromBooking(booking.id);
  }

  // 5. Cleanup
  const missingBookings = await prisma.booking.findMany({
    where: {
      apartmentId: apartment.id,
      source: "airbnb",
      status: "ACTIVE",
      NOT: {
        externalId: { in: activeExternalIds }
      }
    }
  });

  for (const b of missingBookings) {
    await prisma.booking.update({
      where: { id: b.id },
      data: { status: "CANCELLED" }
    });
    await syncCleaningTaskFromBooking(b.id);
  }

  // 6. Update lastSyncAt
  await prisma.apartment.update({
    where: { id: apartment.id },
    data: { lastSyncAt: new Date() }
  });

  return activeExternalIds.length;
}

export async function performAllApartmentsIcalSync() {
  const apartments = await prisma.apartment.findMany({
    where: {
      AND: [
        { icalUrl: { not: null } },
        { icalUrl: { not: "" } },
      ],
    },
    select: { id: true }
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
