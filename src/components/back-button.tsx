"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function BackButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-500 shadow-sm hover:text-slate-900 transition-colors shrink-0"
      aria-label="Torna indietro"
    >
      <ArrowLeft size={18} />
    </button>
  );
}
