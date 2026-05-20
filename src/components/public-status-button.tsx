"use client";

import { useState } from "react";
import { updateCleaningStatus } from "@/src/app/actions/operational";

interface PublicStatusButtonProps {
  id: string;
  nextStatus: string;
  label: string;
  afterLabel: string;   // testo mostrato dopo il click (prima del reload)
  className?: string;
}

export default function PublicStatusButton({ id, nextStatus, label, afterLabel, className }: PublicStatusButtonProps) {
  const [clicked, setClicked] = useState(false);

  async function handleClick() {
    if (clicked) return;
    setClicked(true);
    await updateCleaningStatus(id, nextStatus);
    // Ricarica la pagina per aggiornare lo stato dal server
    window.location.reload();
  }

  return (
    <button
      onClick={handleClick}
      disabled={clicked}
      className={`${className ?? ""} flex items-center justify-center gap-2 disabled:opacity-80`}
    >
      {clicked ? afterLabel : label}
    </button>
  );
}
