"use client";

import { useState, useEffect } from "react";

type SafeDateTimeZone = "UTC" | "Europe/Rome" | "local";

interface SafeDateProps {
  date: Date | string;
  format?: Intl.DateTimeFormatOptions;
  locale?: string;
  className?: string;
  showTimeAgo?: boolean;
  serverDate?: string;
  isExplicit?: boolean; // New prop for "DD/MM/YYYY alle HH:mm"
  timeZone?: SafeDateTimeZone;
}

export default function SafeDate({ 
  date, 
  format = { day: 'numeric', month: 'long', year: 'numeric' }, 
  locale = "it-IT",
  className = "",
  showTimeAgo = false,
  serverDate,
  isExplicit = false,
  timeZone = "local"
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

  const formatWithTimeZone =
    timeZone === "local" ? format : { ...format, timeZone };

  const getDateParts = (targetTimeZone: SafeDateTimeZone) => {
    if (targetTimeZone === "UTC") {
      return {
        day: String(d.getUTCDate()).padStart(2, '0'),
        month: String(d.getUTCMonth() + 1).padStart(2, '0'),
        year: String(d.getUTCFullYear()),
        hours: String(d.getUTCHours()).padStart(2, '0'),
        minutes: String(d.getUTCMinutes()).padStart(2, '0'),
      };
    }

    const parts = new Intl.DateTimeFormat("en-GB", {
      ...(targetTimeZone === "Europe/Rome" ? { timeZone: "Europe/Rome" } : {}),
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(d);

    return {
      day: parts.find((part) => part.type === "day")?.value ?? "00",
      month: parts.find((part) => part.type === "month")?.value ?? "00",
      year: parts.find((part) => part.type === "year")?.value ?? "0000",
      hours: parts.find((part) => part.type === "hour")?.value ?? "00",
      minutes: parts.find((part) => part.type === "minute")?.value ?? "00",
    };
  };

  // Targeted Fix: During the first pass, render a stable, manual format (DD/MM/YYYY)
  // that is guaranteed to be identical between server and client.
  if (!mounted) {
    const { day, month, year, hours, minutes } = getDateParts("UTC");
    
    if (isExplicit) {
      return <span className={className}>{`${day}/${month}/${year} alle ${hours}:${minutes}`}</span>;
    }
    return <span className={className}>{`${day}/${month}/${year}`}</span>;
  }

  if (isExplicit) {
    const { day, month, year, hours, minutes } = getDateParts(timeZone);
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
      {new Intl.DateTimeFormat(locale, formatWithTimeZone).format(d)}
    </span>
  );
}
