"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft, X } from "lucide-react";

export default function BackButton() {
  const router = useRouter();
  return (
    <>
      {/* Desktop: freccia indietro */}
      <button
        onClick={() => router.back()}
        className="hidden md:flex h-10 w-10 items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-500 shadow-sm hover:text-slate-900 transition-colors shrink-0"
        aria-label="Torna indietro"
      >
        <ArrowLeft size={18} />
      </button>
      {/* Mobile: X per chiudere e tornare al sheet */}
      <button
        onClick={() => router.back()}
        className="flex md:hidden h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 active:bg-slate-200 transition-colors shrink-0"
        aria-label="Chiudi"
      >
        <X size={20} />
      </button>
    </>
  );
}
