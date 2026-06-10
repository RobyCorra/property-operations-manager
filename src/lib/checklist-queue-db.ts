/**
 * IndexedDB per la coda delle spunte checklist offline.
 * Quando il device è offline, le spunte vengono salvate qui
 * e sincronizzate al ritorno della connessione.
 */

const DB_NAME = "checklist-offline-queue";
const STORE   = "progress";
const VERSION = 1;

export interface ChecklistQueueEntry {
  taskId:    string;
  items:     unknown; // ChecklistItem[]
  savedAt:   number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "taskId" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

/** Salva (o sovrascrive) il progresso corrente di un task. */
export async function saveChecklistProgress(taskId: string, items: unknown): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx  = db.transaction(STORE, "readwrite");
      const req = tx.objectStore(STORE).put({ taskId, items, savedAt: Date.now() });
      req.onsuccess = () => resolve();
      req.onerror   = () => reject(req.error);
    });
  } catch (err) {
    console.warn("[checklist-queue] saveChecklistProgress failed:", err);
  }
}

/** Legge il progresso salvato offline per un task (se esiste). */
export async function getChecklistProgress(taskId: string): Promise<ChecklistQueueEntry | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx  = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(taskId);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror   = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

/** Rimuove il progresso dopo sync riuscita. */
export async function clearChecklistProgress(taskId: string): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx  = db.transaction(STORE, "readwrite");
      const req = tx.objectStore(STORE).delete(taskId);
      req.onsuccess = () => resolve();
      req.onerror   = () => reject(req.error);
    });
  } catch (err) {
    console.warn("[checklist-queue] clearChecklistProgress failed:", err);
  }
}
