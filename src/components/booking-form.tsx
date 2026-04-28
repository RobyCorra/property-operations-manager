"use client";

import { useActionState, useState, useEffect } from "react";
import Link from "next/link";
import { createBooking, updateBooking, getApartmentBookings } from "@/src/app/actions/booking";
import AvailabilityPicker from "./availability-picker";

interface ApartmentOption {
  id: string;
  name: string;
}

interface BookingInitialData {
  id: string;
  apartmentId: string;
  guestName: string;
  totalGuests: number;
  checkInDate: Date;
  checkOutDate: Date;
}

interface BookingFormProps {
  apartments: ApartmentOption[];
  initialData?: BookingInitialData;
  serverDate: string;
}

export default function BookingForm({ apartments, initialData, serverDate }: BookingFormProps) {
  const isEditing = !!initialData;
  const action = isEditing 
    ? updateBooking.bind(null, initialData!.id) 
    : createBooking;

  const [state, formAction, isPending] = useActionState(action, null);
  
  const [apartmentId, setApartmentId] = useState(initialData?.apartmentId || "");
  const [occupiedRanges, setOccupiedRanges] = useState<any[]>([]);
  const [selectedRange, setSelectedRange] = useState<{ from: Date | null; to: Date | null }>({ 
    from: initialData?.checkInDate || null, 
    to: initialData?.checkOutDate || null 
  });
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);

  useEffect(() => {
    async function loadAvailability() {
      if (!apartmentId) {
        setOccupiedRanges([]);
        return;
      }

      setIsLoadingAvailability(true);
      try {
        const bookings = await getApartmentBookings(apartmentId);
        // If editing, filter out the current booking from occupied ranges to allow moving it within the same window
        const filteredBookings = isEditing && apartmentId === initialData?.apartmentId
          ? bookings.filter((b: any) => {
              const bIn = new Date(b.checkInDate).getTime();
              const bOut = new Date(b.checkOutDate).getTime();
              const iIn = new Date(initialData.checkInDate).getTime();
              const iOut = new Date(initialData.checkOutDate).getTime();
              return !(bIn === iIn && bOut === iOut);
            })
          : bookings;
        
        setOccupiedRanges(filteredBookings);
      } catch (error) {
        console.error("Failed to fetch availability:", error);
      } finally {
        setIsLoadingAvailability(false);
      }
    }

    loadAvailability();
    // Only reset range if apartment changed and it's not the initial load of the edit form
    if (!isEditing || apartmentId !== initialData?.apartmentId) {
      if (apartmentId !== initialData?.apartmentId) {
        setSelectedRange({ from: null, to: null });
      }
    }
  }, [apartmentId]);

  const formatToISODate = (date: Date | null) => {
    if (!date) return "";
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return (
    <section className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden p-6 md:p-8">
      <form action={formAction} className="space-y-8">
        
        {state?.error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium">
            {state.error}
          </div>
        )}

        <div className="space-y-6">
          <h2 className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-2">
            {isEditing ? "Modifica Prenotazione" : "Dettagli Prenotazione"}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="guestName" className="block text-sm font-medium text-gray-700 mb-1.5">Nome Ospite *</label>
                <input 
                  required 
                  type="text" 
                  id="guestName" 
                  name="guestName" 
                  defaultValue={initialData?.guestName}
                  placeholder="Es. Mario Rossi" 
                  className="w-full rounded-xl border-gray-200 border px-4 py-3 outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all" 
                />
              </div>

              <div>
                <label htmlFor="apartmentId" className="block text-sm font-medium text-gray-700 mb-1.5">Appartamento *</label>
                <select 
                  required 
                  id="apartmentId" 
                  name="apartmentId" 
                  value={apartmentId}
                  onChange={(e) => setApartmentId(e.target.value)}
                  className="w-full rounded-xl border-gray-200 border px-4 py-3 outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                >
                  <option value="">Seleziona un appartamento</option>
                  {apartments.map((apt) => (
                    <option key={apt.id} value={apt.id}>{apt.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="totalGuests" className="block text-sm font-medium text-gray-700 mb-1.5">Ospiti Totali *</label>
                <input 
                  required 
                  type="number" 
                  min="1" 
                  id="totalGuests" 
                  name="totalGuests" 
                  defaultValue={initialData?.totalGuests || "1"}
                  className="w-full rounded-xl border-gray-200 border px-4 py-3 outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all" 
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Periodo di Soggiorno * 
                {isLoadingAvailability && <span className="ml-2 text-[10px] text-gray-400 animate-pulse">Caricamento disponibilità...</span>}
              </label>
              
              <AvailabilityPicker 
                occupiedRanges={occupiedRanges}
                onRangeSelect={setSelectedRange}
                initialRange={isEditing && apartmentId === initialData?.apartmentId ? { from: initialData.checkInDate, to: initialData.checkOutDate } : undefined}
                serverDate={serverDate}
              />

              {/* Hidden inputs to preserve form data for the server action */}
              <input 
                type="hidden" 
                name="checkInDate" 
                value={formatToISODate(selectedRange.from)} 
              />
              <input 
                type="hidden" 
                name="checkOutDate" 
                value={formatToISODate(selectedRange.to)} 
              />

              {!apartmentId && (
                <p className="text-[10px] text-gray-400">Seleziona un appartamento per vedere la disponibilità live</p>
              )}
            </div>
          </div>
        </div>

        <div className="pt-6 flex items-center justify-end gap-4 mt-8 border-t border-gray-50">
          <Link href="/dashboard/manager/bookings" className="px-6 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
            Annulla
          </Link>
          <button 
            type="submit" 
            disabled={isPending || !selectedRange.from || !selectedRange.to}
            className="rounded-full bg-black px-10 py-3 text-sm font-medium text-white shadow-md transition-all hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            {isPending ? "Salvataggio..." : isEditing ? "Aggiorna Prenotazione" : "Crea Prenotazione"}
          </button>
        </div>
        
      </form>
    </section>
  );
}
