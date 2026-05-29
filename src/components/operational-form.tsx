"use client";

import { useActionState, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getApartmentSchedule } from "@/src/app/actions/operational";
import { formatRomeDateInputValue, formatRomeTimeInputValue } from "@/src/lib/rome-datetime";
import MaintenanceTaskEditor from "@/src/components/maintenance-task-editor";
import type { MaintenanceTask } from "@/src/components/maintenance-task-editor";

interface ApartmentSchedule {
  bookings: Booking[];
  cleanings: { id: string; date: Date; status: string }[];
  tickets: { id: string; scheduledStart: Date | null; scheduledEnd: Date | null; title: string }[];
}

interface Option {
  id: string;
  name: string;
}

interface Booking {
  id: string;
  guestName: string;
  checkInDate: Date;
  checkOutDate: Date;
}

interface OperationalInitialData {
  id: string;
  apartmentId: string;
  assignedToId?: string | null;
  date?: Date;
  notes?: string | null;
  title?: string;
  priority?: string;
  description?: string;
  scheduledStart?: Date | null;
  scheduledEnd?: Date | null;
  status: string;
  maintenanceTasks?: unknown;
}

interface OperationalFormProps {
  type: "CLEANING" | "MAINTENANCE";
  apartments: Option[];
  personnel: Option[];
  action: (id: string, prevState: any, formData: FormData) => Promise<any> | ((prevState: any, formData: FormData) => Promise<any>);
  initialData?: OperationalInitialData;
}

type ActionState = {
  error?: string;
  success?: boolean;
} | null;

type BookingJson = {
  id: string;
  guestName?: string | null;
  checkInDate: string | Date;
  checkOutDate: string | Date;
  [key: string]: unknown;
};

type CleaningJson = {
  id: string;
  date: string | Date;
  status: string;
  [key: string]: unknown;
};

type TicketJson = {
  id: string;
  scheduledStart?: string | Date | null;
  scheduledEnd?: string | Date | null;
  title: string;
  [key: string]: unknown;
};

export default function OperationalForm({ type, apartments, personnel, action, initialData }: OperationalFormProps) {
  const isEditing = !!initialData;
  // If editing, we use the action bound with the ID. 
  // If not, we use the provided action directly (which matches the (prevState, formData) signature).
  const finalAction = isEditing ? (action as any).bind(null, initialData.id) : action;
  
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(finalAction, null);
  const [selectedApartment, setSelectedApartment] = useState(initialData?.apartmentId || "");
  const [schedule, setSchedule] = useState<ApartmentSchedule | null>(null);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  
  const [localStart, setLocalStart] = useState<string>(initialData?.scheduledStart ? new Date(initialData.scheduledStart).toISOString().slice(0, 16) : "");
  const [localEnd, setLocalEnd] = useState<string>(initialData?.scheduledEnd ? new Date(initialData.scheduledEnd).toISOString().slice(0, 16) : "");
  const [warnings, setWarnings] = useState<string[]>([]);

  useEffect(() => {
    if (selectedApartment) {
      setIsLoadingBookings(true);
      getApartmentSchedule(selectedApartment)
        .then((data) => {
          // Normalize dates from JSON response strings to Date objects if needed
          const normalized = {
            bookings: data.bookings.map((b: BookingJson) => ({ ...b, guestName: b.guestName ?? "", checkInDate: new Date(b.checkInDate), checkOutDate: new Date(b.checkOutDate) })),
            cleanings: data.cleanings.map((c: CleaningJson) => ({ ...c, date: new Date(c.date) })),
            tickets: data.tickets.map((t: TicketJson) => ({ ...t, scheduledStart: t.scheduledStart ? new Date(t.scheduledStart) : null, scheduledEnd: t.scheduledEnd ? new Date(t.scheduledEnd) : null }))
          };
          setSchedule(normalized);
        })
        .finally(() => setIsLoadingBookings(false));
    } else {
      setSchedule(null);
    }
  }, [selectedApartment]);

  const checkConflicts = useCallback(() => {
    if (!localStart || !localEnd || !schedule) {
      setWarnings([]);
      return;
    }

    const start = new Date(localStart);
    const end = new Date(localEnd);
    const newWarnings: string[] = [];

    const isSameDay = (d1: Date, d2: Date) => 
      d1.getUTCDate() === d2.getUTCDate() && 
      d1.getUTCMonth() === d2.getUTCMonth() && 
      d1.getUTCFullYear() === d2.getUTCFullYear();

    const isOverlap = (s1: Date, e1: Date, s2: Date, e2: Date) => (s1 < e2 && e1 > s2);

    // 1. Check Bookings
    schedule.bookings.forEach(b => {
      if (isOverlap(start, end, b.checkInDate, b.checkOutDate)) {
        newWarnings.push(`⚠️ Conflitto: Intervento durante il soggiorno di ${b.guestName}`);
      } else {
        if (isSameDay(start, b.checkInDate)) newWarnings.push(`ℹ️ Nota: Lo stesso giorno c'è un Check-in (${b.guestName})`);
        if (isSameDay(start, b.checkOutDate)) newWarnings.push(`ℹ️ Nota: Lo stesso giorno c'è un Check-out (${b.guestName})`);
      }
    });

    // 2. Check Cleanings
    schedule.cleanings.forEach(c => {
      if (isSameDay(start, c.date) || isSameDay(end, c.date)) {
        newWarnings.push(`ℹ️ Nota: È prevista una pulizia lo stesso giorno`);
      }
    });

    // 3. Check Other Tickets
    schedule.tickets.forEach(t => {
      if (t.id !== initialData?.id && t.scheduledStart && t.scheduledEnd) {
        if (isOverlap(start, end, t.scheduledStart, t.scheduledEnd)) {
          newWarnings.push(`⚠️ Conflitto: Esiste già un altro intervento programmato (${t.title})`);
        }
      }
    });

    setWarnings(newWarnings);
  }, [localStart, localEnd, schedule, initialData?.id]);

  useEffect(() => {
    checkConflicts();
  }, [checkConflicts]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (type === "MAINTENANCE") {
      const formData = new FormData(e.currentTarget);
      const start = formData.get("scheduledStart") as string;
      const end = formData.get("scheduledEnd") as string;

      if (!start || !end) {
        e.preventDefault();
        alert("Inserisci data e ora di inizio e fine dell’intervento");
        return;
      }

      if (new Date(end) <= new Date(start)) {
        e.preventDefault();
        alert("La data di fine non può essere precedente o uguale alla data di inizio");
        return;
      }
    }
  };

  const formatDateTime = (date?: Date | null) => {
    if (!date) return "";
    return `${formatRomeDateInputValue(date)}T${formatRomeTimeInputValue(date)}`;
  };

  return (
    <section className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden p-6 md:p-8">
      <form action={formAction} onSubmit={handleSubmit} className="space-y-6">
        {state?.error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-medium">
            {state.error}
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="apartmentId" className="block text-sm font-medium text-gray-700 mb-1">Appartamento *</label>
                  <select 
                    required 
                    id="apartmentId" 
                    name="apartmentId" 
                    value={selectedApartment}
                    onChange={(e) => setSelectedApartment(e.target.value)}
                    className="w-full rounded-lg border-gray-300 border px-4 py-2.5 outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  >
                    <option value="">Seleziona...</option>
                    {apartments.map((apt) => (
                      <option key={apt.id} value={apt.id}>{apt.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="assignedToId" className="block text-sm font-medium text-gray-700 mb-1">Assegna a</label>
                <select 
                  id="assignedToId" 
                  name="assignedToId" 
                defaultValue={initialData?.assignedToId || ""}
                  className="w-full rounded-lg border-gray-300 border px-4 py-2.5 outline-none focus:ring-2 focus:ring-black focus:border-transparent text-gray-700"
                >
                <option value="">Nessun assegnatario</option>
                {personnel.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Contextual Booking Info */}
          {selectedApartment && (
            <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100/50">
              <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-3">Prenotazioni in programma</h4>
              {isLoadingBookings ? (
                <p className="text-sm text-blue-500 animate-pulse">Caricamento prenotazioni...</p>
              ) : schedule && schedule.bookings.length > 0 ? (
                <div className="space-y-2">
                  {schedule.bookings.slice(0, 3).map((b) => (
                    <div key={b.id} className="flex items-center justify-between text-sm bg-white p-2 rounded-lg shadow-sm">
                      <span className="font-semibold text-gray-900">{b.guestName}</span>
                      <span className="text-gray-500">
                        {new Date(b.checkInDate).toLocaleDateString("it-IT", { day: 'numeric', month: 'short' })} - {new Date(b.checkOutDate).toLocaleDateString("it-IT", { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  ))}
                  {schedule.bookings.length > 3 && <p className="text-[10px] text-blue-400 text-center">+ altre {schedule.bookings.length - 3} prenotazioni</p>}
                </div>
              ) : (
                <p className="text-sm text-blue-500">Nessuna prenotazione futura per questo immobile.</p>
              )}
            </div>
          )}

          {type === "CLEANING" ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Data Intervento *</label>
                    <input
                      required
                      type="date"
                      id="date"
                      name="date"
                      defaultValue={initialData?.date ? formatRomeDateInputValue(initialData.date) : ""}
                      className="w-full rounded-lg border-gray-300 border px-4 py-2.5 outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">Ora Intervento *</label>
                    <input
                      required
                      type="time"
                      id="time"
                      name="time"
                      defaultValue={initialData?.date ? formatRomeTimeInputValue(initialData.date) : "10:00"}
                      className="w-full rounded-lg border-gray-300 border px-4 py-2.5 outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Note / Istruzioni</label>
                    <input 
                      type="text" 
                      id="notes" 
                      name="notes" 
                    defaultValue={initialData?.notes || ""}
                      placeholder="Es. Pulizia profonda, cambio lenzuola" 
                      className="w-full rounded-lg border-gray-300 border px-4 py-2.5 outline-none focus:ring-2 focus:ring-black focus:border-transparent" 
                    />
                </div>
              </div>
              {isEditing && (
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Stato Pulizia</label>
                  <select 
                    id="status" 
                    name="status" 
                    defaultValue={initialData.status}
                    className="w-full rounded-lg border-gray-300 border px-4 py-2.5 outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  >
                    <option value="PENDING">Da fare</option>
                    <option value="IN_PROGRESS">In corso</option>
                    <option value="AWAITING_REVIEW">In verifica</option>
                    <option value="APPROVED">Approvato</option>
                  </select>
                </div>
              )}
              {isEditing && (
                <input type="hidden" name="cleaningTaskId" value={initialData.id} />
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Titolo Problema *</label>
                  <input 
                    required 
                    type="text" 
                    id="title" 
                    name="title" 
                    defaultValue={initialData?.title || ""}
                    placeholder="Es. Perdita rubinetto cucina" 
                    className="w-full rounded-lg border-gray-300 border px-4 py-2.5 outline-none focus:ring-2 focus:ring-black focus:border-transparent" 
                  />
                </div>
                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">Priorità *</label>
                  <select 
                    required 
                    id="priority" 
                    name="priority" 
                    defaultValue={initialData?.priority || "MEDIUM"}
                    className="w-full rounded-lg border-gray-300 border px-4 py-2.5 outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  >
                    <option value="LOW">Bassa</option>
                    <option value="MEDIUM">Media</option>
                    <option value="HIGH">Alta</option>
                    <option value="URGENT">Urgente</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="scheduledStart" className="block text-sm font-medium text-gray-700 mb-1">Inizio Intervento Programmato *</label>
                  <input 
                    required 
                    type="datetime-local" 
                    id="scheduledStart" 
                    name="scheduledStart" 
                    value={localStart}
                    onChange={(e) => setLocalStart(e.target.value)}
                    className="w-full rounded-lg border-gray-300 border px-4 py-2.5 outline-none focus:ring-2 focus:ring-black focus:border-transparent" 
                  />
                </div>
                <div>
                  <label htmlFor="scheduledEnd" className="block text-sm font-medium text-gray-700 mb-1">Fine Intervento Programmata *</label>
                  <input 
                    required 
                    type="datetime-local" 
                    id="scheduledEnd" 
                    name="scheduledEnd" 
                    value={localEnd}
                    onChange={(e) => setLocalEnd(e.target.value)}
                    className="w-full rounded-lg border-gray-300 border px-4 py-2.5 outline-none focus:ring-2 focus:ring-black focus:border-transparent" 
                  />
                </div>
              </div>

              {warnings.length > 0 && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-1 animate-in fade-in slide-in-from-top-2">
                  <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-2">
                    <span>⚠️</span> Possibili Conflitti Rilevati
                  </h4>
                  <ul className="list-none space-y-1">
                    {warnings.map((w, i) => (
                      <li key={i} className="text-xs text-amber-600 font-medium">{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {isEditing && (
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Stato Ticket</label>
                  <select 
                    id="status" 
                    name="status" 
                    defaultValue={initialData.status}
                    className="w-full rounded-lg border-gray-300 border px-4 py-2.5 outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  >
                    <option value="PENDING">In attesa</option>
                    <option value="IN_PROGRESS">In corso</option>
                    <option value="AWAITING_REVIEW">In verifica</option>
                    <option value="APPROVED">Approvato</option>
                  </select>
                </div>
              )}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
                <textarea 
                  id="description" 
                  name="description" 
                  rows={3}
                  defaultValue={initialData?.description || ""}
                  className="w-full rounded-lg border-gray-300 border px-4 py-2.5 outline-none focus:ring-2 focus:ring-black focus:border-transparent" 
                />
              </div>

              {/* Maintenance Tasks */}
              <div className="pt-4 border-t border-gray-50">
                <MaintenanceTaskEditor
                  initialTasks={
                    Array.isArray(initialData?.maintenanceTasks)
                      ? (initialData.maintenanceTasks as MaintenanceTask[])
                      : []
                  }
                />
              </div>

              {/* Maintenance Attachments (Manager Side) */}
              <div className="pt-4 border-t border-gray-50">
                <label className="block text-sm font-medium text-gray-700 mb-2">Allegati (Immagini, Video, PDF)</label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <span className="text-2xl mb-2">📁</span>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Trascina o clicca per caricare</p>
                      <p className="text-[9px] text-gray-400 mt-1">Supporta multipli file</p>
                    </div>
                    <input 
                      type="file" 
                      name="files" 
                      multiple 
                      className="hidden" 
                      accept="image/*,video/*,application/pdf"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 flex items-center justify-end gap-3 mt-8 border-t border-gray-50 pt-6">
          <Link href={isEditing ? (type === "CLEANING" ? "/dashboard/manager/cleanings" : "/dashboard/manager/maintenance") : "/dashboard/manager"} className="px-5 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
            Annulla
          </Link>
          <button 
            type="submit" 
            disabled={isPending}
            className="rounded-full bg-black px-10 py-2.5 text-sm font-medium text-white shadow-md transition-all hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isPending ? "Salvataggio..." : isEditing ? "Aggiorna Intervento" : (type === "CLEANING" ? "Pianifica Pulizia" : "Apri Ticket")}
          </button>
        </div>
      </form>
    </section>
  );
}
