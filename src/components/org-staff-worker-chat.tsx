"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { getMyOrgStaffThread, sendMyOrgStaffMessage } from "@/src/app/actions/messages";
import type { ChatMsg } from "@/src/app/actions/company";
import ImpresaChatThread from "@/src/components/impresa-chat-thread";
import { playMessageBeep, setupNotificationAudio } from "@/src/lib/notification-sound";

export default function OrgStaffWorkerChat({ initial }: { initial: ChatMsg[] }) {
  const [messages, setMessages] = useState<ChatMsg[]>(initial);
  const [, startLoad] = useTransition();
  const prevCount = useRef(initial.length);

  const reload = () => startLoad(async () => {
    const fresh = await getMyOrgStaffThread();
    if (fresh.length > prevCount.current) {
      const hasManagerMsg = fresh.slice(prevCount.current).some(m => !m.mine);
      if (hasManagerMsg) playMessageBeep();
    }
    prevCount.current = fresh.length;
    setMessages(fresh);
  });

  useEffect(() => { setupNotificationAudio(); }, []);

  useEffect(() => {
    let alive = true;
    const poll = async () => {
      try {
        const fresh = await getMyOrgStaffThread();
        if (!alive) return;
        if (fresh.length > prevCount.current) {
          const hasManagerMsg = fresh.slice(prevCount.current).some(m => !m.mine);
          if (hasManagerMsg) playMessageBeep();
        }
        prevCount.current = fresh.length;
        setMessages(fresh);
      } catch {}
    };
    const id = setInterval(poll, 5000);
    const onFocus = () => poll();
    window.addEventListener("focus", onFocus);
    return () => { alive = false; clearInterval(id); window.removeEventListener("focus", onFocus); };
  }, []);

  return (
    <ImpresaChatThread
      headerName="La tua organizzazione"
      messages={messages}
      onSend={(fd) => sendMyOrgStaffMessage(fd)}
      onSent={reload}
    />
  );
}
