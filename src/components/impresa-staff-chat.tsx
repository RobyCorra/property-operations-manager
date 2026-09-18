"use client";

import { useState, useTransition } from "react";
import { getMyImpresaThread, sendMyImpresaMessage, type ChatMsg } from "@/src/app/actions/company";
import ImpresaChatThread from "@/src/components/impresa-chat-thread";

export default function ImpresaStaffChat({ initial }: { initial: ChatMsg[] }) {
  const [messages, setMessages] = useState<ChatMsg[]>(initial);
  const [, startLoad] = useTransition();
  const reload = () => startLoad(async () => setMessages(await getMyImpresaThread()));

  return (
    <ImpresaChatThread
      headerName="La tua impresa"
      messages={messages}
      onSend={(fd) => sendMyImpresaMessage(fd)}
      onSent={reload}
    />
  );
}
