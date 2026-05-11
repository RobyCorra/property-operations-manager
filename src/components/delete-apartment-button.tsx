"use client";

import { useState } from "react";
import { deleteApartment } from "@/src/app/actions/apartment";
import { Trash2 } from "./icons";

type DeleteApartmentButtonProps = {
  id: string;
};

export default function DeleteApartmentButton({ id }: DeleteApartmentButtonProps) {
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
      alert(result.error);
      setLoading(false);
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
