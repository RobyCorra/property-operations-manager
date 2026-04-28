import { NextRequest, NextResponse } from "next/server";
import { performApartmentIcalSync } from "@/src/lib/server/ical-sync";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    // Basic auth check
    const cookieStore = await cookies();
    const role = cookieStore.get("role")?.value;
    
    if (role !== "MANAGER") {
      return NextResponse.json({ error: "Accesso negato." }, { status: 403 });
    }

    const { apartmentId } = await req.json();

    if (!apartmentId) {
      return NextResponse.json({ error: "ID appartamento mancante." }, { status: 400 });
    }

    const count = await performApartmentIcalSync(apartmentId);

    return NextResponse.json({ success: true, count });
  } catch (error: any) {
    console.error("[iCal API] Sync error:", error);
    return NextResponse.json(
      { error: error.message || "Errore durante la sincronizzazione." },
      { status: 500 }
    );
  }
}
