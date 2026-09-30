"use client";

import { useState, useTransition } from "react";
import { Camera, CheckCircle2, Circle, Loader2 } from "lucide-react";
import { useLang } from "@/src/components/lang-context";
import { updateManualTaskProgress } from "@/src/app/actions/operational";

interface ManualTask {
  id: string;
  label: string;
  photoRequired: boolean;
  completed: boolean;
  photoUrl: string | null;
}

interface Props {
  taskId: string;
  initialTasks: ManualTask[];
}

export default function ManualTasksChecklist({ taskId, initialTasks }: Props) {
  const { t } = useLang();
  const [tasks, setTasks] = useState<ManualTask[]>(initialTasks);
  const [isPending, startTransition] = useTransition();
  const [savingId, setSavingId] = useState<string | null>(null);

  const completedCount = tasks.filter((t) => t.completed).length;

  function toggleTask(id: string) {
    const updated = tasks.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t,
    );
    setTasks(updated);
    setSavingId(id);
    startTransition(async () => {
      await updateManualTaskProgress(taskId, updated);
      setSavingId(null);
    });
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <p className="font-semibold text-slate-800 text-sm">Task da completare</p>
        <p className="text-xs text-slate-400">
          {completedCount} / {tasks.length}
        </p>
      </div>
      <div className="p-3 space-y-2">
        {tasks.map((task, idx) => (
          <button
            key={task.id}
            type="button"
            onClick={() => toggleTask(task.id)}
            className={`w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors ${
              task.completed
                ? "bg-emerald-50 border border-emerald-200"
                : "bg-gray-50 border border-gray-200"
            }`}
          >
            <span className="flex-shrink-0">
              {savingId === task.id && isPending ? (
                <Loader2 size={20} className="text-violet-500 animate-spin" />
              ) : task.completed ? (
                <CheckCircle2 size={20} className="text-emerald-500" />
              ) : (
                <Circle size={20} className="text-gray-300" />
              )}
            </span>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${task.completed ? "text-emerald-700 line-through" : "text-slate-800"}`}>
                {idx + 1}. {task.label}
              </p>
              {task.photoRequired && !task.completed && (
                <span className="inline-flex items-center gap-1 text-[10px] text-violet-600 font-semibold mt-0.5">
                  <Camera size={10} /> Foto richiesta
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
