"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { resolveMaintenanceTicket } from "@/src/app/actions/operational";

interface Props {
  ticketId: string;
}

export default function MaintenanceResolutionForm({ ticketId }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await resolveMaintenanceTicket(ticketId, formData);
      if (result.error) {
        setError(result.error);
      } else {
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          Foto Intervento (Opzionale)
        </label>
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <span className="text-2xl mb-2">📸</span>
              <p className="text-xs font-medium text-gray-500">Clicca per caricare foto</p>
            </div>
            <input 
              type="file" 
              name="files" 
              className="hidden" 
              multiple 
              accept="image/*" 
            />
          </label>
        </div>
      </div>

      {error && (
        <p className="text-red-500 text-xs font-bold bg-red-50 p-3 rounded-xl border border-red-100">
          ⚠️ {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-red-600 text-white font-bold py-4 rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-100 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isPending ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Salvataggio...
          </>
        ) : (
          "Segnala come Risolto"
        )}
      </button>
    </form>
  );
}
