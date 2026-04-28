"use client";

import { useState } from "react";
import { deleteCleaningTask, deleteMaintenanceTicket } from "@/src/app/actions/operational";
import { Trash2 } from "./icons";

type DeleteOperationalButtonProps = {
  id: string;
  type: "CLEANING" | "MAINTENANCE";
};

export default function DeleteOperationalButton({ id, type }: DeleteOperationalButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const label = type === "CLEANING" ? "questa pulizia" : "questo ticket di manutenzione";
    if (confirm(`Sei sicuro di voler eliminare ${label}? L'azione è irreversibile.`)) {
      setIsDeleting(true);
      try {
        if (type === "CLEANING") {
          await deleteCleaningTask(id);
        } else {
          await deleteMaintenanceTicket(id);
        }
      } catch (error) {
        console.error("Failed to delete operational record:", error);
        alert("Errore durante l'eliminazione.");
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
