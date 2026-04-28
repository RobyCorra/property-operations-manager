"use client";

import { Trash2 } from "./icons";

export default function DeleteUserButton({ id }: any) {
  return (
    <div className="inline-block">
      <button 
        type="button"
        disabled
        className="w-10 h-10 flex items-center justify-center rounded-full text-slate-300 cursor-not-allowed opacity-50"
        title="Eliminazione team temporaneamente disattivata"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}
