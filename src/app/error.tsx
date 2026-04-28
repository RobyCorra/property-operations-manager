"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Route Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 text-center space-y-6 animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto border border-red-100">
          <span className="text-4xl text-red-500">⚠️</span>
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Qualcosa è andato storto</h1>
          <p className="text-gray-500 text-sm">
            {error.message || "Si è verificato un errore imprevisto durante la navigazione."}
          </p>
        </div>

        <div className="pt-4 flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="w-full bg-black text-white py-4 rounded-2xl font-bold text-sm hover:bg-gray-800 transition-all active:scale-95 shadow-lg shadow-gray-100"
          >
            Riprova
          </button>
          
          <button
            onClick={() => window.location.href = "/"}
            className="w-full bg-white text-gray-500 py-2 text-xs font-semibold hover:text-gray-900 transition-colors"
          >
            Torna alla Home
          </button>
        </div>
        
        {error.digest && (
          <p className="text-[10px] text-gray-300 font-mono tracking-tighter">
            ID Errore: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
