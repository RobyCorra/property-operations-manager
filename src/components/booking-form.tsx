"use client";

import { useActionState, useState, useEffect } from "react";
import { useLang } from "@/src/components/lang-context";
import Link from "next/link";
import { createBooking, updateBooking } from "@/src/app/actions/booking";

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
  cullaRequested?: boolean;
}

interface BookingFormProps {
  apartments: ApartmentOption[];
  initialData?: BookingInitialData;
  serverDate: string;
}

const formatDateToISO = (date: Date | null) => {
  if (!date) return "";
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatInputDateLabel = (value: string) => {
  if (!value) return "";
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
};

const addDaysToInputDate = (value: string, days: number) => {
  if (!value) return "";
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return formatDateToISO(date);
};

export default function BookingForm({ apartments, initialData, serverDate }: BookingFormProps) {
  const { t } = useLang();
  const isEditing = !!initialData;
  const action = isEditing 
    ? updateBooking.bind(null, initialData!.id) 
    : createBooking;

  const [state, formAction, isPending] = useActionState(action, null);
  
  const [apartmentId, setApartmentId] = useState(initialData?.apartmentId || "");
  const [checkInDate, setCheckInDate] = useState(() => formatDateToISO(initialData?.checkInDate ?? null));
  const [checkOutDate, setCheckOutDate] = useState(() => formatDateToISO(initialData?.checkOutDate ?? null));
  const [cullaRequested, setCullaRequested] = useState(initialData?.cullaRequested ?? false);

  useEffect(() => {
    if (apartmentId !== initialData?.apartmentId) {
      setCheckInDate("");
      setCheckOutDate("");
    }
  }, [apartmentId, initialData?.apartmentId]);

  const checkInMin = !isEditing ? formatDateToISO(new Date(serverDate)) : "";
  const checkOutMin = checkInDate ? addDaysToInputDate(checkInDate, 1) : "";
  const rangeSummary = checkInDate && checkOutDate
    ? `Dal giorno ${formatInputDateLabel(checkInDate)} al giorno ${formatInputDateLabel(checkOutDate)}`
    : "Seleziona check-in e check-out";
  const isDateRangeInvalid = !!(checkInDate && checkOutDate && checkOutDate <= checkInDate);

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
            {isEditing ? t.bfEditTitle : t.bfDetails}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="guestName" className="block text-sm font-medium text-gray-700 mb-1.5">{t.bfGuestName} *</label>
                <input 
                  required 
                  type="text" 
                  id="guestName" 
                  name="guestName" 
                  defaultValue={initialData?.guestName}
                  placeholder={t.bfGuestPlaceholder} 
                  className="w-full rounded-xl border-gray-200 border px-4 py-3 outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all" 
                />
              </div>

              <div>
                <label htmlFor="apartmentId" className="block text-sm font-medium text-gray-700 mb-1.5">{t.bfApartment} *</label>
                <select 
                  required 
                  id="apartmentId" 
                  name="apartmentId" 
                  value={apartmentId}
                  onChange={(e) => setApartmentId(e.target.value)}
                  className="w-full rounded-xl border-gray-200 border px-4 py-3 outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                >
                  <option value="">{t.bfSelectApartment}</option>
                  {apartments.map((apt) => (
                    <option key={apt.id} value={apt.id}>{apt.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="totalGuests" className="block text-sm font-medium text-gray-700 mb-1.5">{t.bfTotalGuests} *</label>
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

            {/* Culla */}
            <input type="hidden" name="cullaRequested" value={cullaRequested ? "true" : "false"} />
            <button
              type="button"
              onClick={() => setCullaRequested((v) => !v)}
              className={`w-full flex items-center justify-between rounded-2xl border px-4 py-3.5 transition-all ${
                cullaRequested
                  ? "bg-emerald-50 border-emerald-300"
                  : "bg-gray-50 border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🪺</span>
                <div className="text-left">
                  <p className={`text-sm font-bold ${cullaRequested ? "text-emerald-800" : "text-gray-700"}`}>
                    {t.bfCotNeeded}
                  </p>
                  <p className={`text-xs ${cullaRequested ? "text-emerald-600" : "text-gray-400"}`}>
                    {t.bfCotHint}
                  </p>
                </div>
              </div>
              <div className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${cullaRequested ? "bg-emerald-500" : "bg-gray-300"}`}>
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${cullaRequested ? "translate-x-5" : "translate-x-0.5"}`} />
              </div>
            </button>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t.bfStayPeriod} *
              </label>

              <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="checkInDate" className="block text-sm font-medium text-gray-700 mb-1.5">
                      {t.bfCheckin} *
                    </label>
                    <input
                      required
                      type="date"
                      id="checkInDate"
                      name="checkInDate"
                      value={checkInDate}
                      min={checkInMin || undefined}
                      onChange={(e) => {
                        const nextValue = e.target.value;
                        setCheckInDate(nextValue);
                        if (checkOutDate && nextValue && checkOutDate <= nextValue) {
                          setCheckOutDate("");
                        }
                      }}
                      className="w-full rounded-xl border-gray-200 border px-4 py-3 outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all bg-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="checkOutDate" className="block text-sm font-medium text-gray-700 mb-1.5">
                      {t.bfCheckout} *
                    </label>
                    <input
                      required
                      type="date"
                      id="checkOutDate"
                      name="checkOutDate"
                      value={checkOutDate}
                      min={checkOutMin || undefined}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      className="w-full rounded-xl border-gray-200 border px-4 py-3 outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all bg-white"
                    />
                  </div>
                </div>

                <div className="rounded-xl bg-white border border-gray-100 px-4 py-3 text-sm text-gray-600">
                  <span className="font-medium text-gray-900">{t.bfSummary}</span> {rangeSummary}
                </div>

                {isDateRangeInvalid && (
                  <p className="text-sm text-amber-700">
                    Il check-out deve essere successivo al check-in.
                  </p>
                )}

                {!apartmentId && (
                  <p className="text-[10px] text-gray-400">
                    {t.bfSelectToComplete}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 flex items-center justify-end gap-4 mt-8 border-t border-gray-50">
          <Link href="/dashboard/manager/bookings" className="px-6 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
            Annulla
          </Link>
          <button 
            type="submit" 
            disabled={isPending || !apartmentId || !checkInDate || !checkOutDate || isDateRangeInvalid}
            className="rounded-full bg-black px-10 py-3 text-sm font-medium text-white shadow-md transition-all hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            {isPending ? "Salvataggio..." : isEditing ? t.bfUpdate : t.bfCreate}
          </button>
        </div>
        
      </form>
    </section>
  );
}
