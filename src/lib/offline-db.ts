const DB_NAME = "bizora-offline";
const DB_VERSION = 2;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains("pending_invoices")) {
        const store = db.createObjectStore("pending_invoices", { keyPath: "id" });
        store.createIndex("created_at", "created_at");
      }
      if (!db.objectStoreNames.contains("pending_customers")) {
        db.createObjectStore("pending_customers", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("pending_products")) {
        db.createObjectStore("pending_products", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("pending_expenses")) {
        db.createObjectStore("pending_expenses", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("pending_payments")) {
        db.createObjectStore("pending_payments", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("cached_data")) {
        db.createObjectStore("cached_data", { keyPath: "key" });
      }
      if (!db.objectStoreNames.contains("sync_queue")) {
        const syncStore = db.createObjectStore("sync_queue", { keyPath: "id", autoIncrement: true });
        syncStore.createIndex("table_name", "table_name");
        syncStore.createIndex("created_at", "created_at");
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export interface OfflineRecord {
  id: string;
  data: any;
  created_at: string;
  synced: boolean;
}

export interface SyncQueueItem {
  id?: number;
  table_name: string;
  operation: "insert" | "update" | "delete";
  data: any;
  record_id: string;
  created_at: string;
}

async function addPending(storeName: string, data: any): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    store.put({
      id: data.id || crypto.randomUUID(),
      data,
      created_at: new Date().toISOString(),
      synced: false,
    });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getPending(storeName: string): Promise<OfflineRecord[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function removePending(storeName: string, id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    store.delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function cacheData(key: string, data: any): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("cached_data", "readwrite");
    const store = tx.objectStore("cached_data");
    store.put({ key, data, cached_at: new Date().toISOString() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getCachedData(key: string): Promise<any | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("cached_data", "readonly");
    const store = tx.objectStore("cached_data");
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result?.data || null);
    request.onerror = () => reject(request.error);
  });
}

async function addToSyncQueue(item: Omit<SyncQueueItem, "id" | "created_at">): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("sync_queue", "readwrite");
    const store = tx.objectStore("sync_queue");
    store.add({
      ...item,
      created_at: new Date().toISOString(),
    });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getSyncQueue(): Promise<SyncQueueItem[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("sync_queue", "readonly");
    const store = tx.objectStore("sync_queue");
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function clearSyncQueue(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("sync_queue", "readwrite");
    const store = tx.objectStore("sync_queue");
    store.clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function removeSyncQueueItem(id: number): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("sync_queue", "readwrite");
    const store = tx.objectStore("sync_queue");
    store.delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export const offlineDB = {
  invoices: {
    add: (data: any) => addPending("pending_invoices", data),
    getAll: () => getPending("pending_invoices"),
    remove: (id: string) => removePending("pending_invoices", id),
  },
  customers: {
    add: (data: any) => addPending("pending_customers", data),
    getAll: () => getPending("pending_customers"),
    remove: (id: string) => removePending("pending_customers", id),
  },
  products: {
    add: (data: any) => addPending("pending_products", data),
    getAll: () => getPending("pending_products"),
    remove: (id: string) => removePending("pending_products", id),
  },
  expenses: {
    add: (data: any) => addPending("pending_expenses", data),
    getAll: () => getPending("pending_expenses"),
    remove: (id: string) => removePending("pending_expenses", id),
  },
  payments: {
    add: (data: any) => addPending("pending_payments", data),
    getAll: () => getPending("pending_payments"),
    remove: (id: string) => removePending("pending_payments", id),
  },
  cache: {
    set: (key: string, data: any) => cacheData(key, data),
    get: (key: string) => getCachedData(key),
  },
  syncQueue: {
    add: (item: Omit<SyncQueueItem, "id" | "created_at">) => addToSyncQueue(item),
    getAll: () => getSyncQueue(),
    remove: (id: number) => removeSyncQueueItem(id),
    clear: () => clearSyncQueue(),
  },
};

export async function syncOfflineData(
  syncFn: (store: string, record: OfflineRecord) => Promise<void>
): Promise<void> {
  const stores = [
    "pending_invoices",
    "pending_customers",
    "pending_products",
    "pending_expenses",
    "pending_payments",
  ];

  for (const store of stores) {
    const records = await getPending(store);
    for (const record of records) {
      try {
        await syncFn(store, record);
        await removePending(store, record.id);
      } catch (e) {
        console.error(`Failed to sync ${store}:`, e);
      }
    }
  }
}

export async function processSyncQueue(
  processFn: (item: SyncQueueItem) => Promise<boolean>
): Promise<{ processed: number; failed: number }> {
  const queue = await getSyncQueue();
  let processed = 0;
  let failed = 0;

  for (const item of queue) {
    try {
      const success = await processFn(item);
      if (success && item.id) {
        await removeSyncQueueItem(item.id);
        processed++;
      } else {
        failed++;
      }
    } catch (e) {
      console.error("Sync queue item failed:", e);
      failed++;
    }
  }

  return { processed, failed };
}
