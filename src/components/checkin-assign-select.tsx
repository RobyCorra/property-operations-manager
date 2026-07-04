"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { assignCheckinTask } from "@/src/app/actions/checkin";

interface Props {
  taskId: string;
  assignedToId: string | null;
  assistants: { id: string; name: string }[];
}

export default function CheckinAssignSelect({ taskId, assignedToId, assistants }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <select
      defaultValue={assignedToId ?? ""}
      disabled={isPending}
      onChange={(e) => {
        const value = e.target.value || null;
        startTransition(async () => {
          try {
            await assignCheckinTask(taskId, value);
            router.refresh();
          } catch (err: unknown) {
            alert((err as Error).message || "Errore durante l'assegnazione.");
          }
        });
      }}
      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-black disabled:opacity-50"
    >
      <option value="">Non assegnato</option>
      {assistants.map((a) => (
        <option key={a.id} value={a.id}>
          {a.name}
        </option>
      ))}
    </select>
  );
}
