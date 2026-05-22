"use client";

import { useState } from "react";
import { Camera, Plus, Trash2, GripVertical } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

export interface MaintenanceTask {
  id: string;
  label: string;
  photoRequired: boolean;
  completed: boolean;
  photoUrl: string | null;
}

interface Props {
  initialTasks?: MaintenanceTask[];
}

export default function MaintenanceTaskEditor({ initialTasks = [] }: Props) {
  const [tasks, setTasks] = useState<MaintenanceTask[]>(initialTasks);

  function addTask() {
    setTasks(prev => [
      ...prev,
      { id: uuidv4(), label: "", photoRequired: false, completed: false, photoUrl: null },
    ]);
  }

  function removeTask(id: string) {
    setTasks(prev => prev.filter(t => t.id !== id));
  }

  function updateLabel(id: string, label: string) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, label } : t));
  }

  function togglePhoto(id: string) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, photoRequired: !t.photoRequired } : t));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          📋 Task dell&apos;intervento
        </p>
        <button
          type="button"
          onClick={addTask}
          className="flex items-center gap-1.5 bg-violet-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg hover:bg-violet-700 transition-colors"
        >
          <Plus size={11} /> Aggiungi task
        </button>
      </div>

      {tasks.length === 0 && (
        <div className="border-2 border-dashed border-gray-200 rounded-xl py-6 text-center">
          <p className="text-xs font-semibold text-gray-400">Nessuna task — opzionale</p>
          <p className="text-[10px] text-gray-300 mt-1">Aggiungi task specifiche da completare durante l&apos;intervento</p>
        </div>
      )}

      <div className="space-y-2">
        {tasks.map((task, idx) => (
          <div key={task.id} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
            {/* Numero */}
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-200 text-gray-500 text-[9px] font-black flex items-center justify-center">
              {idx + 1}
            </span>

            {/* Label */}
            <input
              type="text"
              value={task.label}
              onChange={e => updateLabel(task.id, e.target.value)}
              placeholder="Descrivi la task..."
              className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-300 outline-none font-medium"
            />

            {/* Toggle foto */}
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
              {task.photoRequired ? "Foto obbligatoria" : "Foto facoltativa"}
            </button>

            {/* Elimina */}
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

      {/* Hidden input — serializza le task come JSON */}
      <input
        type="hidden"
        name="maintenanceTasks"
        value={JSON.stringify(tasks)}
      />
    </div>
  );
}
