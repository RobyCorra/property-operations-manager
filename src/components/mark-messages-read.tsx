"use client";

import { useEffect } from "react";

interface Props {
  ticketId: string;
  markAsRead: (id: string) => Promise<void>;
}

export default function MarkMessagesRead({ ticketId, markAsRead }: Props) {
  useEffect(() => {
    markAsRead(ticketId).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId]);

  return null;
}
