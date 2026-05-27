/**
 * IndexedDB wrapper per la coda foto della checklist pulizia.
 *
 * Struttura: DB "cleaning-photo-queue" / store "photos"
 * Le entry vengono create al momento dello scatto e cancellate dopo l'upload riuscito.
 * I Blob vengono salvati nativamente (IndexedDB supporta Blob direttamente).
 */

const DB_NAME = "cleaning-photo-queue";
const STORE   = "photos";
const VERSION = 1;

export interface PhotoQueueEntry {
  id?: number;
  taskId:    string;
  itemId:    string;
  blob:      Blob;
  filename:  string;
  createdAt: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);

    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id", autoIncrement: true });
        store.createIndex("byTask", "taskId", { unique: false });
        store.createIndex("byItem", ["taskId", "itemId"], { unique: false });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  });
}

/** Salva una foto in coda. Sovrascrive eventuali entry precedenti per lo stesso item. */
export async function saveToQueue(
  taskId:   string,
  itemId:   string,
  blob:     Blob,
  filename: string,
): Promise<void> {
  try {
    const db = await openDB();

    // Rimuovi entry precedenti per lo stesso item (evita duplicati)
    await deleteFromQueue(taskId, itemId, db);

    await new Promise<void>((resolve, reject) => {
      const tx    = db.transaction(STORE, "readwrite");
      const store = tx.objectStore(STORE);
      const entry: PhotoQueueEntry = { taskId, itemId, blob, filename, createdAt: Date.now() };
      const req = store.add(entry);
      req.onsuccess = () => resolve();
      req.onerror   = () => reject(req.error);
    });
  } catch (err) {
    console.warn("[photo-queue] saveToQueue failed:", err);
  }
}

/** Legge tutte le foto in coda per un task. */
export async function getQueueForTask(taskId: string): Promise<PhotoQueueEntry[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx    = db.transaction(STORE, "readonly");
      const store = tx.objectStore(STORE);
      const index = store.index("byTask");
      const req   = index.getAll(taskId);
      req.onsuccess = () => resolve(req.result ?? []);
      req.onerror   = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

/** Rimuove una foto dalla coda dopo upload riuscito. */
export async function deleteFromQueue(
  taskId: string,
  itemId: string,
  _db?: IDBDatabase,
): Promise<void> {
  try {
    const db = _db ?? await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx    = db.transaction(STORE, "readwrite");
      const store = tx.objectStore(STORE);
      const index = store.index("byItem");
      const req   = index.openCursor(IDBKeyRange.only([taskId, itemId]));
      req.onsuccess = () => {
        const cursor = req.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("[photo-queue] deleteFromQueue failed:", err);
  }
}

/** Rimuove tutte le foto di un task (cleanup post-completamento). */
export async function clearQueueForTask(taskId: string): Promise<void> {
  try {
    const entries = await getQueueForTask(taskId);
    for (const entry of entries) {
      if (entry.id != null) {
        const db = await openDB();
        await new Promise<void>((resolve) => {
          const tx    = db.transaction(STORE, "readwrite");
          const store = tx.objectStore(STORE);
          store.delete(entry.id!);
          tx.oncomplete = () => resolve();
        });
      }
    }
  } catch (err) {
    console.warn("[photo-queue] clearQueueForTask failed:", err);
  }
}
