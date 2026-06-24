"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/src/lib/prisma";
import { syncCleaningTaskFromBooking } from "./operational";
import { consumeProductsOnCheckin } from "./product";

type PrismaTx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

export async function createBooking(prevState: any, formData: FormData) {
  const apartmentId = formData.get("apartmentId") as string;
  const totalGuests = parseInt(formData.get("totalGuests") as string, 10);
  const checkInDate = new Date(formData.get("checkInDate") as string);
  const checkOutDate = new Date(formData.get("checkOutDate") as string);
  const rawGuestName = formData.get("guestName");
  const cullaRequested = formData.get("cullaRequested") === "true";

  const guestName = typeof rawGuestName === "string" && rawGuestName.trim() !== ""
    ? rawGuestName.trim()
    : null;

  // --- LOG 1: SUBMIT BOOKING START ---
  console.log("[FORENSIC] 1. SUBMIT BOOKING START", {
    apartmentId,
    guestName,
    totalGuests,
    checkInDate: checkInDate.toISOString(),
    checkOutDate: checkOutDate.toISOString()
  });

  if (!(formData instanceof FormData)) {
    console.error("[DEBUG] formData is not an instance of FormData. Received:", formData);
    return { error: "Errore interno: i dati del form non sono validi." };
  }

  console.log("FORM DATA ENTRIES", [...formData.entries()]);

  // Normalize dates to midnight UTC to ensure consistent comparison across timezones
  checkInDate.setUTCHours(0, 0, 0, 0);
  checkOutDate.setUTCHours(0, 0, 0, 0);

  // 1. Basic Validation (guestName is now optional)
  if (!apartmentId || isNaN(totalGuests) || isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
    return { error: "Tutti i campi sono obbligatori." };
  }

  if (checkOutDate <= checkInDate) {
    return { error: "La data di check-out deve essere successiva alla data di check-in." };
  }

  // 2. Fetch Apartment to check maxGuests
  const apartment = await prisma.apartment.findUnique({
    where: { id: apartmentId },
  });

  if (!apartment) {
    return { error: "Appartamento non trovato." };
  }

  if (totalGuests > apartment.maxGuests) {
    return { error: `Il numero massimo di ospiti per questo appartamento è ${apartment.maxGuests}.` };
  }

  // 3. Overlap Check
  console.log(`[DEBUG BOOKING] Checking overlap for appt ${apartmentId}: ${checkInDate.toISOString()} to ${checkOutDate.toISOString()}`);
  const overlappingBooking = await prisma.booking.findFirst({
    where: {
      apartmentId,
      status: { not: "CANCELLED" },
      AND: [
        { checkInDate: { lt: checkOutDate } },
        { checkOutDate: { gt: checkInDate } },
      ],
    },
    select: { id: true, source: true, guestName: true }
  });

  if (overlappingBooking) {
    const isIcal = overlappingBooking.source === 'airbnb' || overlappingBooking.source === 'ical';
    const sourceMsg = isIcal ? "importata via iCal/Airbnb" : "interna";
    console.log(`[DEBUG BOOKING] Conflict found with ${sourceMsg} booking: ${overlappingBooking.id}`);
    return { error: `Conflitto: esiste già una prenotazione ${sourceMsg} (${overlappingBooking.guestName}) per queste date.` };
  }

  // 4. Create Booking & Actions within Transaction
  try {
    await prisma.$transaction(async (tx: PrismaTx) => {
      // --- LOG 2: BEFORE BOOKING CREATE ---
      console.log("[FORENSIC] 2. BEFORE BOOKING CREATE entering transaction...");

      const dbBooking = await tx.booking.create({
        data: {
          apartmentId,
          totalGuests,
          checkInDate,
          checkOutDate,
          status: "CONFIRMED",
          source: "manual",
          guestName, // può essere null
          cullaRequested,
        },
      });

      // --- STEP 3: BLOCCO SICUREZZA ---
      if (!dbBooking || !dbBooking.id) {
        throw new Error("Errore creazione prenotazione: ID mancante.");
      }

      // --- LOG 3: BOOKING CREATE RESULT ---
      console.log(`[FORENSIC] 3. BOOKING CREATE RESULT: Success ID=${dbBooking.id}`);

      // 5. Auto-sync Cleaning Task within the same transaction
      console.log(`[BOOKING->CLEANING] Triggering sync for NEW booking: ${dbBooking.id} (Source: ${dbBooking.source})`);
      await syncCleaningTaskFromBooking(dbBooking.id, tx);
      console.log(`[BOOKING->CLEANING] Sync call completed for NEW booking: ${dbBooking.id}`);
    });
  } catch (error: any) {
    console.error("Error creating booking:", error);
    // --- LOG 6: FINAL RESPONSE TO UI (Error) ---
    console.log("[FORENSIC] 6. FINAL RESPONSE TO UI", { success: false, error: error.message });
    return { error: error.message || "Si è verificato un errore durante la creazione della prenotazione.", success: false };
  }

  // --- LOG 6: FINAL RESPONSE TO UI (Success) ---
  console.log("[FORENSIC] 6. FINAL RESPONSE TO UI", { success: true, redirect: "/dashboard/manager/bookings" });

  try {
    const freshBooking = await prisma.booking.findFirst({
      where: { apartmentId, guestName, checkInDate },
      orderBy: { createdAt: 'desc' }
    });
    console.log("[DEBUG POST-CREATE] Verification:", freshBooking ? {
      id: freshBooking.id,
      status: freshBooking.status,
      source: freshBooking.source,
      createdAt: freshBooking.createdAt
    } : "Record not found immediately after transaction!");
  } catch (diagErr) {
    console.error("[DEBUG POST-CREATE] Failed to read diagnostic record", diagErr);
  }

  revalidatePath("/dashboard/manager/bookings");
  revalidatePath("/dashboard/manager");
  redirect("/dashboard/manager/bookings");
}

export async function updateBooking(id: string, prevState: any, formData: FormData) {
  const apartmentId = formData.get("apartmentId") as string;
  const totalGuests = parseInt(formData.get("totalGuests") as string, 10);
  const checkInDate = new Date(formData.get("checkInDate") as string);
  const checkOutDate = new Date(formData.get("checkOutDate") as string);
  const cullaRequested = formData.get("cullaRequested") === "true";

  const rawGuestName = formData.get("guestName");
  const guestName = typeof rawGuestName === "string" && rawGuestName.trim() !== ""
    ? rawGuestName.trim()
    : null;

  // Normalize dates to midnight UTC
  checkInDate.setUTCHours(0, 0, 0, 0);
  checkOutDate.setUTCHours(0, 0, 0, 0);

  if (!(formData instanceof FormData)) {
    console.error("[DEBUG] updateBooking: formData is not an instance of FormData. Received:", formData);
    return { error: "Errore interno: i dati del form non sono validi." };
  }

  console.log("UPDATE FORM DATA ENTRIES", [...formData.entries()]);

  // 1. Basic Validation (guestName is now optional)
  if (!id || !apartmentId || isNaN(totalGuests) || isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
    return { error: "Tutti i campi sono obbligatori." };
  }

  if (checkOutDate <= checkInDate) {
    return { error: "La data di check-out deve essere successiva alla data di check-in." };
  }

  // 2. Fetch Apartment to check maxGuests
  const apartment = await prisma.apartment.findUnique({
    where: { id: apartmentId },
  });

  if (!apartment) {
    return { error: "Appartamento non trovato." };
  }

  if (totalGuests > apartment.maxGuests) {
    return { error: `Il numero massimo di ospiti per questo appartamento è ${apartment.maxGuests}.` };
  }

  // 3. Overlap Check (Excluding self)
  console.log(`[DEBUG BOOKING] Checking overlap for Update ${id}: ${checkInDate.toISOString()} to ${checkOutDate.toISOString()}`);
  const overlappingBooking = await prisma.booking.findFirst({
    where: {
      apartmentId,
      status: { not: "CANCELLED" },
      NOT: { id },
      AND: [
        { checkInDate: { lt: checkOutDate } },
        { checkOutDate: { gt: checkInDate } },
      ],
    },
    select: { id: true, source: true, guestName: true }
  });

  if (overlappingBooking) {
    const isIcal = overlappingBooking.source === 'airbnb' || overlappingBooking.source === 'ical';
    const sourceMsg = isIcal ? "importata via iCal/Airbnb" : "interna";
    console.log(`[DEBUG BOOKING] Conflict found with ${sourceMsg} booking: ${overlappingBooking.id}`);
    return { error: `Conflitto: esiste già una prenotazione ${sourceMsg} (${overlappingBooking.guestName}) nelle date selezionate.` };
  }

  // 4. Update Booking & Sync within transaction
  try {
    await prisma.$transaction(async (tx: PrismaTx) => {
      await tx.booking.update({
        where: { id },
        data: {
          totalGuests,
          checkInDate,
          checkOutDate,
          status: "CONFIRMED",
          source: "manual",
          guestName, // può essere null
          cullaRequested,
        },
      });

      // 5. Auto-sync Cleaning Task
      console.log(`[BOOKING->CLEANING] Triggering sync for UPDATED booking: ${id}`);
      await syncCleaningTaskFromBooking(id, tx);
      console.log(`[BOOKING->CLEANING] Sync call completed for UPDATED booking: ${id}`);
    });
  } catch (error: any) {
    console.error("Error updating booking:", error);
    return { error: error.message || "Si è verificato un errore durante l'aggiornamento." };
  }

  revalidatePath("/dashboard/manager/bookings");
  revalidatePath("/dashboard/manager/cleanings");
  revalidatePath("/dashboard/manager");
  redirect("/dashboard/manager/bookings");
}

export async function deleteBooking(id: string) {
  // 1. Logical Cancellation of Booking
  const booking = await prisma.booking.update({
    where: { id },
    data: { status: "CANCELLED" },
  });

  // 2. Sync Cleaning Task (will set task to CANCELLED if it's PENDING)
  await syncCleaningTaskFromBooking(booking.id);

  revalidatePath("/dashboard/manager/bookings");
  revalidatePath("/dashboard/manager/cleanings");
  revalidatePath("/dashboard/manager");
}

export async function getApartmentBookings(apartmentId: string) {
  if (!apartmentId) return [];

  const bookings = await prisma.booking.findMany({
    where: { 
      apartmentId,
      status: { not: "CANCELLED" }
    },
    select: {
      checkInDate: true,
      checkOutDate: true,
    },
    orderBy: {
      checkInDate: "asc",
    },
  });

  return bookings;
}

export async function confirmCheckIn(bookingId: string) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new Error("Prenotazione non trovata.");
  if (booking.status === "CANCELLED") throw new Error("Prenotazione annullata.");

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CHECKED_IN" },
  });

  // Sottrai i prodotti consumati per questo check-in
  await consumeProductsOnCheckin(booking.apartmentId, booking.totalGuests ?? 1);

  revalidatePath("/dashboard/manager");
  revalidatePath("/dashboard/manager/mappa");
  revalidatePath("/dashboard/owner");
}
