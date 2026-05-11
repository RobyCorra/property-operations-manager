"use client";

import { deleteApartment } from "@/src/app/actions/apartment";
import { Trash2 } from "./icons";

type DeleteApartmentButtonProps = {
  id: string;
};

export default function DeleteApartmentButton({ id }: DeleteApartmentButtonProps) {
  const handleDelete = async (formData: FormData) => {
    if (window.confirm("Sei sicuro di voler eliminare questo appartamento? L'azione è irreversibile.")) {
      try {
        await deleteApartment(formData);
      } catch (error: any) {
        alert(error.message || "Errore durante l'eliminazione.");
      }
    }
  };

  return (
    <form action={handleDelete} className="inline-block">
      <input type="hidden" name="id" value={id} />
      <button 
        type="submit"
        className="w-10 h-10 flex items-center justify-center rounded-full text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all"
        title="Elimina"
      >
        <Trash2 size={18} />
      </button>
    </form>
  );
}
