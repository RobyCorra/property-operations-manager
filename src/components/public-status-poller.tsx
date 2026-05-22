"use client";

import { useEffect, useState } from "react";

interface Props {
  waitingAutoUpdate: (s: number) => string;
  waitingCheckNow: string;
}

export default function PublicStatusPoller({ waitingAutoUpdate, waitingCheckNow }: Props) {
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          window.location.reload();
          return 30;
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center justify-between gap-3 mt-2">
      <p className="text-xs text-amber-500">
        {waitingAutoUpdate(countdown)}
      </p>
      <button
        onClick={() => window.location.reload()}
        className="text-xs font-medium text-amber-700 underline underline-offset-2 hover:text-amber-900 transition-colors"
      >
        {waitingCheckNow}
      </button>
    </div>
  );
}
