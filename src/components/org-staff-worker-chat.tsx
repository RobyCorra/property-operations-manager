"use client";

import { useState, useTransition } from "react";
import { getMyOrgStaffThread, sendMyOrgStaffMessage } from "@/src/app/actions/messages";
import type { ChatMsg } from "@/src/app/actions/company";
import ImpresaChatThread from "@/src/components/impresa-chat-thread";

export default function OrgStaffWorkerChat({ initial }: { initial: ChatMsg[] }) {
  const [messages, setMessages] = useState<ChatMsg[]>(initial);
  const [, startLoad] = useTransition();
  const reload = () => startLoad(async () => setMessages(await getMyOrgStaffThread()));

  return (
    <ImpresaChatThread
      headerName="La tua organizzazione"
      messages={messages}
      onSend={(fd) => sendMyOrgStaffMessage(fd)}
      onSent={reload}
    />
  );
}
