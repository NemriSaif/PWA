// Offline Queue Manager
// Stores pending CREATE/UPDATE/DELETE operations while offline
// Syncs them automatically when connection returns

import { initDB } from './offlineStorage';

const QUEUE_STORE = 'pending_operations';

export interface PendingOperation {
  id: string; // UUID for queue item
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entityType: 'chantier' | 'personnel' | 'vehicule' | 'daily-assignment' | 'fournisseur' | 'stock';
  endpoint: string;
  data?: any;
  timestamp: string;
  status: 'pending' | 'syncing' | 'failed';
  tempId?: string; // Temporary ID for new items
  retries: number;
  error?: string;
}

// Add operation to queue
export const addToQueue = async (operation: Omit<PendingOperation, 'id' | 'timestamp' | 'status' | 'retries'>): Promise<string> => {
  const db = await initDB();
  const transaction = db.transaction(QUEUE_STORE, 'readwrite');
  const store = transaction.objectStore(QUEUE_STORE);
  
  const queueItem: PendingOperation = {
    ...operation,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    status: 'pending',
    retries: 0,
  };
  
  store.put(queueItem);
  
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => {
      console.log('✅ Operation queued:', queueItem);
      resolve(queueItem.id);
    };
    transaction.onerror = () => reject(transaction.error);
  });
};

// Get all pending operations
export const getQueue = async (): Promise<PendingOperation[]> => {
  const db = await initDB();
  const transaction = db.transaction(QUEUE_STORE, 'readonly');
  const store = transaction.objectStore(QUEUE_STORE);
  const request = store.getAll();
  
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
};

// Remove operation from queue
export const removeFromQueue = async (id: string): Promise<void> => {
  const db = await initDB();
  const transaction = db.transaction(QUEUE_STORE, 'readwrite');
  const store = transaction.objectStore(QUEUE_STORE);
  
  store.delete(id);
  
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
};

// Update operation status
export const updateOperationStatus = async (
  id: string,
  status: PendingOperation['status'],
  error?: string
): Promise<void> => {
  const db = await initDB();
  const transaction = db.transaction(QUEUE_STORE, 'readwrite');
  const store = transaction.objectStore(QUEUE_STORE);
  
  const request = store.get(id);
  
  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      const operation = request.result;
      if (operation) {
        operation.status = status;
        if (error) operation.error = error;
        if (status === 'failed') operation.retries += 1;
        store.put(operation);
      }
    };
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
};

// Get queue count
export const getQueueCount = async (): Promise<number> => {
  const queue = await getQueue();
  return queue.filter(op => op.status === 'pending').length;
};

// Clear all operations (use with caution)
export const clearQueue = async (): Promise<void> => {
  const db = await initDB();
  const transaction = db.transaction(QUEUE_STORE, 'readwrite');
  const store = transaction.objectStore(QUEUE_STORE);
  
  store.clear();
  
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
};
