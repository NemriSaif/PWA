// Offline Storage Utility for PWA
// This handles caching API responses in IndexedDB for offline access

const DB_NAME = 'GMS_Offline_DB';
const DB_VERSION = 5; // Incremented to add orders store
const STORES = {
  workSites: 'worksites',
  personnel: 'personnel',
  vehicles: 'vehicles',
  dailyAssignments: 'dailyassignments',
  suppliers: 'suppliers',
  stock: 'stock',
  orders: 'orders',
  pendingOperations: 'pending_operations', // NEW: Queue for offline changes
};

// Initialize IndexedDB
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object stores if they don't exist
      Object.entries(STORES).forEach(([key, storeName]) => {
        if (!db.objectStoreNames.contains(storeName)) {
          // Use 'id' as keyPath for pending_operations, '_id' for others
          const keyPath = storeName === 'pending_operations' ? 'id' : '_id';
          const objectStore = db.createObjectStore(storeName, { keyPath });
          
          // Add indexes for pending_operations
          if (storeName === 'pending_operations') {
            objectStore.createIndex('status', 'status', { unique: false });
            objectStore.createIndex('timestamp', 'timestamp', { unique: false });
          }
        }
      });
    };
  });
};

// Save data to IndexedDB
export const saveToOfflineStorage = async (storeName: string, data: any[]) => {
  try {
    const db = await initDB();
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    
    // Clear existing data
    store.clear();
    
    // Add new data
    data.forEach(item => store.put(item));
    
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.error('Error saving to offline storage:', error);
    throw error;
  }
};

// Get data from IndexedDB
export const getFromOfflineStorage = async (storeName: string): Promise<any[]> => {
  try {
    const db = await initDB();
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Error getting from offline storage:', error);
    return [];
  }
};

// Check if online
export const isOnline = () => {
  return navigator.onLine;
};

// Get store name for different entity types
export const getStoreName = (entityType: 'chantier' | 'personnel' | 'vehicule' | 'daily-assignment' | 'stock' | 'order') => {
  const mapping: Record<string, string> = {
    'chantier': STORES.workSites,
    'personnel': STORES.personnel,
    'vehicule': STORES.vehicles,
    'daily-assignment': STORES.dailyAssignments,
    'stock': STORES.stock,
    'order': STORES.orders,
  };
  return mapping[entityType] || STORES.workSites;
};
