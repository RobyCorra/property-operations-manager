"use client";

import { useState } from "react";
import { Camera, Plus, Trash2 } from "lucide-react";

function newId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export interface CleaningManualTask {
  id: string;
  label: string;
  photoRequired: boolean;
  completed: boolean;
  photoUrl: string | null;
}

interface Props {
  tasks: CleaningManualTask[];
  onChange: (tasks: CleaningManualTask[]) => void;
}

export default function CleaningTaskEditor({ tasks, onChange }: Props) {
  const [draft, setDraft] = useState("");

  function addTask() {
    const label = draft.trim();
    if (!label) return;
    onChange([...tasks, { id: newId(), label, photoRequired: false, completed: false, photoUrl: null }]);
    setDraft("");
  }

  function removeTask(id: string) {
    onChange(tasks.filter((t) => t.id !== id));
  }

  function updateLabel(id: string, label: string) {
    onChange(tasks.map((t) => (t.id === id ? { ...t, label } : t)));
  }

  function togglePhoto(id: string) {
    onChange(tasks.map((t) => (t.id === id ? { ...t, photoRequired: !t.photoRequired } : t)));
  }

  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm">📋</span>
          <p className="text-sm font-medium text-gray-700">Task manuali</p>
        </div>
        <span className="text-[10px] text-gray-400">Opzionale</span>
      </div>
      <p className="text-xs text-gray-400">
        Aggiungi attività specifiche per questa pulizia (come per le manutenzioni)
      </p>

      {tasks.length > 0 && (
        <div className="space-y-2">
          {tasks.map((task, idx) => (
            <div key={task.id} className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-200 text-gray-500 text-[9px] font-black flex items-center justify-center">
                {idx + 1}
              </span>
              <input
                type="text"
                value={task.label}
                onChange={(e) => updateLabel(task.id, e.target.value)}
                placeholder="Descrivi la task..."
                className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-300 outline-none font-medium"
              />
              <button
                type="button"
                onClick={() => togglePhoto(task.id)}
                title={task.photoRequired ? "Foto obbligatoria" : "Foto non richiesta"}
                className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wide px-2 py-1 rounded-lg transition-colors flex-shrink-0 ${
                  task.photoRequired
                    ? "bg-violet-100 text-violet-700 border border-violet-200"
                    : "bg-gray-100 text-gray-400 border border-gray-200"
                }`}
              >
                <Camera size={11} />
                {task.photoRequired ? "Foto" : "No foto"}
              </button>
              <button
                type="button"
                onClick={() => removeTask(task.id)}
                className="flex-shrink-0 text-gray-300 hover:text-red-400 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTask(); } }}
          placeholder="Aggiungi una task..."
          className="flex-1 rounded-lg border-gray-300 border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-black focus:border-transparent"
        />
        <button
          type="button"
          onClick={addTask}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Plus size={14} /> Aggiungi
        </button>
      </div>
    </div>
  );
}
