"use client";

import { useState } from "react";
import { deleteApartment } from "@/src/app/actions/apartment";
import { Trash2 } from "./icons";
import { useToast } from "@/src/components/toast-provider";

type DeleteApartmentButtonProps = {
  id: string;
};

export default function DeleteApartmentButton({ id }: DeleteApartmentButtonProps) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm("Sei sicuro di voler eliminare questo appartamento? L'azione è irreversibile.")) {
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.set("id", id);

    const result = await deleteApartment(formData);

    if (result?.success === false) {
      toast.error(result.error);
      setLoading(false);
      return;
    }

    // First call returned counts — related records exist, ask for cascade confirmation
    if (result && "counts" in result) {
      const { bookings, cleanings, tickets } = result.counts;
      const parts: string[] = [];
      if (bookings > 0) parts.push(`${bookings} prenotazion${bookings === 1 ? "e" : "i"}`);
      if (cleanings > 0) parts.push(`${cleanings} pulizi${cleanings === 1 ? "a" : "e"}`);
      if (tickets > 0) parts.push(`${tickets} ticket`);
      const detail = parts.join(", ");

      if (!window.confirm(`Verranno eliminati anche: ${detail}. Continuare?`)) {
        setLoading(false);
        return;
      }

      const confirmedFormData = new FormData();
      confirmedFormData.set("id", id);
      confirmedFormData.set("confirmed", "true");

      const finalResult = await deleteApartment(confirmedFormData);
      if (finalResult?.success === false) {
        toast.error(finalResult.error);
        setLoading(false);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="w-10 h-10 flex items-center justify-center rounded-full text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all disabled:opacity-40"
      title="Elimina"
    >
      <Trash2 size={18} />
    </button>
  );
}
