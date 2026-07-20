"use client";

import { useState } from "react";
import { deleteBooking } from "@/src/app/actions/booking";
import { Trash2 } from "./icons";
import { useToast } from "@/src/components/toast-provider";

type DeleteBookingButtonProps = {
  bookingId: string;
};

export default function DeleteBookingButton({ bookingId }: DeleteBookingButtonProps) {
  const toast = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirm("Sei sicuro di voler eliminare questa prenotazione? L'azione è irreversibile.")) {
      setIsDeleting(true);
      try {
        await deleteBooking(bookingId);
      } catch (error) {
        console.error("Failed to delete booking:", error);
        toast.error("Errore durante l'eliminazione della prenotazione.");
        setIsDeleting(false);
      }
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${
          isDeleting ? "bg-slate-50 text-slate-300 cursor-not-allowed" : "text-slate-300 hover:text-rose-500 hover:bg-rose-50"
      }`}
      title="Elimina"
    >
      <Trash2 size={18} className={isDeleting ? "animate-pulse" : ""} />
    </button>
  );
}
