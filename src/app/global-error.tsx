"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "@/src/app/globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="it" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex items-center justify-center bg-gray-50 p-6 font-sans">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto shadow-xl">
            <span className="text-4xl">💀</span>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">Errore Critico di Sistema</h1>
            <p className="text-gray-500 text-sm">
              Si è verificato un errore nel caricamento dell'interfaccia principale. 
            </p>
          </div>

          <button
            onClick={() => reset()}
            className="w-full bg-black text-white py-4 rounded-2xl font-bold text-sm hover:bg-gray-800 transition-all active:scale-95"
          >
            Ripristina Applicazione
          </button>
          
          <p className="text-[10px] text-gray-300 font-mono">
            {error.message}
          </p>
        </div>
      </body>
    </html>
  );
}
