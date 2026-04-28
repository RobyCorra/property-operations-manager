"use client";

import { useEffect } from "react";
import { markConversationAsRead } from "@/src/app/actions/messages";

interface Props {
  id: string;
  type: "MAINTENANCE" | "CLEANING";
}

export default function MarkReadTrigger({ id, type }: Props) {
  useEffect(() => {
    // We call the server action from the client to avoid revalidatePath errors during render
    markConversationAsRead(id, type);
  }, [id, type]);

  return null;
}
