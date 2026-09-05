// Livello di persistenza locale (IndexedDB). Ogni scrittura passa da qui,
// così sync.js può intercettare le stesse operazioni per replicarle altrove.
const DB_NAME = 'contanti-db';
const DB_VERSION = 1;
const STORES = ['funds', 'transactions', 'kv'];

let dbPromise = null;

function openDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('funds')) {
        db.createObjectStore('funds', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('transactions')) {
        const store = db.createObjectStore('transactions', { keyPath: 'id' });
        store.createIndex('byDate', 'date');
        store.createIndex('byFund', 'fundId');
      }
      if (!db.objectStoreNames.contains('kv')) {
        db.createObjectStore('kv', { keyPath: 'key' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function tx(storeName, mode) {
  return openDB().then((db) => db.transaction(storeName, mode).objectStore(storeName));
}

function reqToPromise(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

const DB = {
  async getAll(storeName) {
    const store = await tx(storeName, 'readonly');
    return reqToPromise(store.getAll());
  },
  async get(storeName, key) {
    const store = await tx(storeName, 'readonly');
    return reqToPromise(store.get(key));
  },
  async put(storeName, value) {
    const store = await tx(storeName, 'readwrite');
    await reqToPromise(store.put(value));
    return value;
  },
  async bulkPut(storeName, values) {
    const store = await tx(storeName, 'readwrite');
    await Promise.all(values.map((v) => reqToPromise(store.put(v))));
    return values;
  },
  async delete(storeName, key) {
    const store = await tx(storeName, 'readwrite');
    return reqToPromise(store.delete(key));
  },
  async clear(storeName) {
    const store = await tx(storeName, 'readwrite');
    return reqToPromise(store.clear());
  },
  async kvGet(key, fallback = null) {
    const row = await DB.get('kv', key);
    return row ? row.value : fallback;
  },
  async kvSet(key, value) {
    return DB.put('kv', { key, value });
  }
};

window.DB = DB;
window.DB_STORES = STORES;
