"use client";

import { useState } from "react";
import { updateCleaningStatus } from "@/src/app/actions/operational";

interface PublicStatusButtonProps {
  id: string;
  nextStatus: string;
  label: string;
  afterLabel: string;
  className?: string;
  afterClassName?: string; // classi CSS da usare dopo il click (sovrascrive className)
}

export default function PublicStatusButton({
  id,
  nextStatus,
  label,
  afterLabel,
  className,
  afterClassName,
}: PublicStatusButtonProps) {
  const [clicked, setClicked] = useState(false);

  async function handleClick() {
    if (clicked) return;
    setClicked(true);
    await updateCleaningStatus(id, nextStatus);
    window.location.reload();
  }

  const activeClass = clicked && afterClassName ? afterClassName : className;

  return (
    <button
      onClick={handleClick}
      disabled={clicked}
      className={`${activeClass ?? ""} flex items-center justify-center gap-2 disabled:cursor-default`}
    >
      {clicked ? afterLabel : label}
    </button>
  );
}
