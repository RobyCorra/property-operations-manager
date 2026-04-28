"use client";

import { useState, useEffect } from "react";

interface SafeDateProps {
  date: Date | string;
  format?: Intl.DateTimeFormatOptions;
  locale?: string;
  className?: string;
  showTimeAgo?: boolean;
  serverDate?: string;
  isExplicit?: boolean; // New prop for "DD/MM/YYYY alle HH:mm"
}

export default function SafeDate({ 
  date, 
  format = { day: 'numeric', month: 'long', year: 'numeric' }, 
  locale = "it-IT",
  className = "",
  showTimeAgo = false,
  serverDate,
  isExplicit = false
}: SafeDateProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!date) {
    return <span className={className}>-</span>;
  }

  const d = new Date(date);
  
  if (isNaN(d.getTime())) {
    return <span className={className}>Data non valida</span>;
  }

  // Targeted Fix: During the first pass, render a stable, manual format (DD/MM/YYYY)
  // that is guaranteed to be identical between server and client.
  if (!mounted) {
    const day = String(d.getUTCDate()).padStart(2, '0');
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const year = d.getUTCFullYear();
    const hours = String(d.getUTCHours()).padStart(2, '0');
    const minutes = String(d.getUTCMinutes()).padStart(2, '0');
    
    if (isExplicit) {
      return <span className={className}>{`${day}/${month}/${year} alle ${hours}:${minutes}`}</span>;
    }
    return <span className={className}>{`${day}/${month}/${year}`}</span>;
  }

  if (isExplicit) {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return <span className={className}>{`${day}/${month}/${year} alle ${hours}:${minutes}`}</span>;
  }

  if (showTimeAgo) {
    const now = serverDate ? new Date(serverDate) : new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000 / 60); // minutes
    
    if (diff < 1) return <span className={className}>Proprio ora</span>;
    if (diff < 60) return <span className={className}>{diff} min fa</span>;
    if (diff < 1440) return <span className={className}>{Math.floor(diff / 60)} ore fa</span>;
  }

  return (
    <span className={className}>
      {d.toLocaleDateString(locale, format)}
    </span>
  );
}
