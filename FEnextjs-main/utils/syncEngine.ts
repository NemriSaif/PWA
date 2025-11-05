// Sync Engine for Offline Queue
// Processes pending operations when connection returns

import { getQueue, removeFromQueue, updateOperationStatus, PendingOperation } from './offlineQueue';
import { saveToOfflineStorage, getStoreName } from './offlineStorage';

// Hardcode API URL to avoid any env variable issues
const API_BASE_URL = 'http://localhost:3001';

// Simple fetch wrapper to avoid axios/webpack issues
const syncFetch = async (endpoint: string, method: string, data?: any) => {
  const url = API_BASE_URL + endpoint;
  const options: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  
  if (data && (method === 'POST' || method === 'PATCH')) {
    options.body = JSON.stringify(data);
  }
  
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Request failed');
  }
  
  if (method !== 'DELETE') {
    return await response.json();
  }
};

// Ultra-simple logging - no spreads, no fancy features
const safeLog = (msg: string, a?: any, b?: any, c?: any) => {
  try {
    if (c !== undefined) console.log(msg, String(a), String(b), String(c));
    else if (b !== undefined) console.log(msg, String(a), String(b));
    else if (a !== undefined) console.log(msg, String(a));
    else console.log(msg);
  } catch {
    // swallow
  }
};

const safeError = (msg: string, err?: any) => {
  try {
    if (err) console.error(msg, String(err));
    else console.error(msg);
  } catch {
    // swallow
  }
};

const safeWarn = (msg: string, a?: any, b?: any) => {
  try {
    if (b !== undefined) console.warn(msg, String(a), String(b));
    else if (a !== undefined) console.warn(msg, String(a));
    else console.warn(msg);
  } catch {
    // swallow
  }
};

export interface SyncResult {
  total: number;
  successful: number;
  failed: number;
  errors: Array<{ operation: PendingOperation; error: string }>;
}

// Sync all pending operations
export const syncQueue = async (): Promise<SyncResult> => {
  const queue = await getQueue();
  const pendingOps = queue.filter(op => op.status === 'pending');
  
  safeLog('🔄 Syncing pending operations count:', pendingOps.length);
  
  const result: SyncResult = {
    total: pendingOps.length,
    successful: 0,
    failed: 0,
    errors: [],
  };
  
  // Process operations in order (FIFO)
  for (const operation of pendingOps) {
    try {
      await updateOperationStatus(operation.id, 'syncing');
      
      safeLog('🔄 Syncing operation:', operation.type, operation.entityType, operation.endpoint);
      
      // Execute the operation with native fetch
      try {
        switch (operation.type) {
          case 'CREATE':
            await syncFetch(operation.endpoint, 'POST', operation.data);
            break;
          case 'UPDATE':
            await syncFetch(operation.endpoint, 'PATCH', operation.data);
            break;
          case 'DELETE':
            await syncFetch(operation.endpoint, 'DELETE');
            break;
        }
      } catch (fetchError: any) {
        // Re-throw with clean message
        throw new Error(fetchError.message || 'Network request failed');
      }
      
      // Success: remove from queue
      await removeFromQueue(operation.id);
      result.successful++;
      
      safeLog('✅ Synced:', operation.type, operation.entityType);
      
    } catch (error: any) {
      // Failure: mark as failed
      const errorMsg = error.message || 'Unknown error';
      safeError('❌ Failed to sync operation:', errorMsg);
      safeLog('Failed operation:', operation.type, operation.entityType, operation.endpoint);
      
      await updateOperationStatus(operation.id, 'failed', errorMsg);
      result.failed++;
      result.errors.push({ operation, error: errorMsg });
      
      // Stop syncing if too many retries
      if (operation.retries >= 3) {
        safeWarn('⚠️ Operation exceeded retry limit, keeping in queue');
      }
    }
  }
  
  // Refresh cache after successful syncs
  if (result.successful > 0) {
    safeLog('🔄 Refreshing cache after successful syncs:', result.successful);
    await refreshAllCaches();
  }
  
  return result;
};

// Refresh all entity caches from server
const refreshAllCaches = async () => {
  const entityTypes = ['chantier', 'personnel', 'vehicule', 'daily-assignment', 'stock'] as const;
  const endpoints = ['/chantier', '/personnel', '/vehicule', '/daily-assignment', '/stock'];
  
  for (let i = 0; i < entityTypes.length; i++) {
    try {
      const data = await syncFetch(endpoints[i], 'GET');
      const storeName = getStoreName(entityTypes[i]);
      await saveToOfflineStorage(storeName, data);
      safeLog('✅ Refreshed cache for:', entityTypes[i]);
    } catch (error) {
      safeWarn('⚠️ Failed to refresh cache for:', entityTypes[i], error);
    }
  }
};

// Auto-sync when coming back online
if (typeof window !== 'undefined') {
  window.addEventListener('online', async () => {
    safeLog('🌐 Connection restored! Starting auto-sync...');
    
    try {
      const result = await syncQueue();
      
      if (result.total === 0) {
        safeLog('ℹ️ No pending operations to sync');
        return;
      }
      
      if (result.successful > 0) {
        // Show success notification
        alert(`✅ Synced ${result.successful} pending changes!`);
      }
      
      if (result.failed > 0) {
        // Show error notification
        alert(`⚠️ ${result.failed} operations failed to sync. Please check and retry.`);
      }
      
    } catch (error) {
      safeError('❌ Auto-sync failed:', error);
    }
  });
}
