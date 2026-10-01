"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getMyTaskUnreadCount } from "@/src/app/actions/messages";
import { playMessageBeep, setupNotificationAudio } from "@/src/lib/notification-sound";

export default function TaskMessagePoller() {
  const prev = useRef(-1);
  const router = useRouter();

  useEffect(() => { setupNotificationAudio(); }, []);

  useEffect(() => {
    let alive = true;
    const poll = async () => {
      try {
        const n = await getMyTaskUnreadCount();
        if (!alive) return;
        if (prev.current >= 0 && n > prev.current) {
          playMessageBeep();
          router.refresh();
        }
        prev.current = n;
      } catch {}
    };
    poll();
    const id = setInterval(poll, 15000);
    const onFocus = () => poll();
    window.addEventListener("focus", onFocus);
    return () => { alive = false; clearInterval(id); window.removeEventListener("focus", onFocus); };
  }, [router]);

  return null;
}
