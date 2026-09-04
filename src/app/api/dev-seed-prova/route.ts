import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";

export const dynamic = "force-dynamic";

// Endpoint TEMPORANEO per popolare l'org di test. Protetto da token, scoped
// SOLO a "Organizzazione Prova 1". Da rimuovere subito dopo l'uso.
const TOKEN = "prova1-seed-9f3a7c";
const ORG_NAME = "Organizzazione Prova 1";

function romeToday(hourUTC: number, minute: number, dayOffset = 0): Date {
  const now = new Date();
  // Settembre = CEST (UTC+2): ora locale Rome = UTC + 2. Passiamo l'ora già in UTC.
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + dayOffset, hourUTC, minute, 0));
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get("token") !== TOKEN) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const mode = searchParams.get("mode") || "inspect";

  const org = await prisma.organization.findFirst({ where: { name: ORG_NAME }, select: { id: true, name: true } });
  if (!org) return NextResponse.json({ error: `Org '${ORG_NAME}' non trovata` }, { status: 404 });

  const apartments = await prisma.apartment.findMany({
    where: { organizationId: org.id },
    select: { id: true, name: true, autoCheckin: true, checkinDefaultTime: true },
    orderBy: { name: "asc" },
  });
  const aptIds = apartments.map((a) => a.id);

  if (mode === "inspect") {
    const [bookings, cleanings, checkins] = await Promise.all([
      prisma.booking.count({ where: { apartmentId: { in: aptIds } } }),
      prisma.cleaningTask.count({ where: { apartmentId: { in: aptIds } } }),
      prisma.checkinTask.count({ where: { apartmentId: { in: aptIds } } }),
    ]);
    return NextResponse.json({ org, apartments, counts: { bookings, cleanings, checkins } });
  }

  if (mode === "seed") {
    // 1) Cancella dati esistenti (task prima delle prenotazioni per i vincoli FK)
    const delCheckins = await prisma.checkinTask.deleteMany({ where: { apartmentId: { in: aptIds } } });
    const delCleanings = await prisma.cleaningTask.deleteMany({ where: { apartmentId: { in: aptIds } } });
    const delBookings = await prisma.booking.deleteMany({ where: { apartmentId: { in: aptIds } } });

    // 2) Almeno 4 appartamenti con check-in presenziale (autoCheckin = false)
    const targets = apartments.slice(0, Math.min(apartments.length, 4));
    if (targets.length === 0) return NextResponse.json({ error: "Nessun appartamento nell'org" }, { status: 400 });
    await prisma.apartment.updateMany({ where: { id: { in: targets.map((a) => a.id) } }, data: { autoCheckin: false } });

    // 3) Per ogni appartamento: giornata di turnover
    //    - partenza oggi 10:00 (OUT), arrivo oggi 15:00 (IN + check-in operativo),
    //    - pulizia oggi 15:40 (PENDING).
    const checkInDate = romeToday(13, 0);       // 15:00 Rome
    const checkOutArrival = romeToday(8, 0, 3); // +3 giorni 10:00 Rome
    const prevCheckIn = romeToday(13, 0, -3);   // 3 giorni fa 15:00 Rome
    const checkOutToday = romeToday(8, 0);      // oggi 10:00 Rome (OUT)
    const cleaningDate = romeToday(13, 40);     // 15:40 Rome

    const created: any = { departures: 0, arrivals: 0, checkinTasks: 0, cleanings: 0, presentialApts: targets.map((a) => a.name) };

    for (let i = 0; i < targets.length; i++) {
      const apt = targets[i];

      // Partenza di oggi (OUT)
      await prisma.booking.create({
        data: {
          apartmentId: apt.id,
          guestName: `Uscita Test ${i + 1}`,
          totalGuests: 2,
          checkInDate: prevCheckIn,
          checkOutDate: checkOutToday,
          status: "CONFIRMED",
          source: "manual",
        },
      });
      created.departures++;

      // Arrivo di oggi (IN)
      const arrival = await prisma.booking.create({
        data: {
          apartmentId: apt.id,
          guestName: `Ospite Test ${i + 1}`,
          totalGuests: 2 + i,
          checkInDate,
          checkOutDate: checkOutArrival,
          status: "CONFIRMED",
          source: "manual",
        },
      });
      created.arrivals++;

      // Check-in operativo (presenziale) di oggi
      await prisma.checkinTask.create({
        data: {
          apartmentId: apt.id,
          bookingId: arrival.id,
          date: checkInDate,
          status: "PENDING",
        },
      });
      created.checkinTasks++;

      // Pulizia di oggi alle 15:40
      await prisma.cleaningTask.create({
        data: {
          apartmentId: apt.id,
          bookingId: arrival.id,
          date: cleaningDate,
          status: "PENDING",
          totalGuests: 2 + i,
        },
      });
      created.cleanings++;
    }

    return NextResponse.json({
      org,
      deleted: { checkins: delCheckins.count, cleanings: delCleanings.count, bookings: delBookings.count },
      created,
    });
  }

  return NextResponse.json({ error: "mode non valido (inspect|seed)" }, { status: 400 });
}
