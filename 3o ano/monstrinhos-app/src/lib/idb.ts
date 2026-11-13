// Pequeno armazenamento no aparelho (IndexedDB) para áudios e dados maiores.
const DB = 'monstrinhos';
const STORE = 'kv';

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const req = fn(t.objectStore(STORE));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export const idb = {
  async get<T = unknown>(key: string): Promise<T | undefined> {
    try {
      return (await tx('readonly', (s) => s.get(key))) as T | undefined;
    } catch {
      return undefined;
    }
  },
  async set(key: string, value: unknown) {
    try {
      await tx('readwrite', (s) => s.put(value, key));
      return true;
    } catch {
      return false;
    }
  },
  async del(key: string) {
    try {
      await tx('readwrite', (s) => s.delete(key));
    } catch {
      /* ignora */
    }
  },
  async keys(prefix: string): Promise<string[]> {
    try {
      const all = (await tx('readonly', (s) => s.getAllKeys())) as IDBValidKey[];
      return all.map(String).filter((k) => k.startsWith(prefix));
    } catch {
      return [];
    }
  },
};

/** localStorage com proteção contra erros (modo privado, cota cheia). */
export const ls = {
  get<T>(key: string): T | null {
    try {
      const v = localStorage.getItem(key);
      return v ? (JSON.parse(v) as T) : null;
    } catch {
      return null;
    }
  },
  set(key: string, value: unknown) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  del(key: string) {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignora */
    }
  },
  keys(prefix: string) {
    const out: string[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(prefix)) out.push(k);
      }
    } catch {
      /* ignora */
    }
    return out;
  },
};
