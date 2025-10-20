// Sync Engine for Offline Queue
// Processes pending operations when connection returns

import { apiClient } from './apiClient';
import { getQueue, removeFromQueue, updateOperationStatus, PendingOperation } from './offlineQueue';
import { saveToOfflineStorage, getStoreName } from './offlineStorage';

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
  
  console.log(`🔄 Syncing ${pendingOps.length} pending operations...`);
  
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
      
      // Execute the operation
      switch (operation.type) {
        case 'CREATE':
          await apiClient.post(operation.endpoint, operation.data);
          break;
        case 'UPDATE':
          await apiClient.patch(operation.endpoint, operation.data);
          break;
        case 'DELETE':
          await apiClient.delete(operation.endpoint);
          break;
      }
      
      // Success: remove from queue
      await removeFromQueue(operation.id);
      result.successful++;
      
      console.log(`✅ Synced ${operation.type} operation for ${operation.entityType}`);
      
    } catch (error: any) {
      // Failure: mark as failed
      const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
      await updateOperationStatus(operation.id, 'failed', errorMsg);
      result.failed++;
      result.errors.push({ operation, error: errorMsg });
      
      console.error(`❌ Failed to sync ${operation.type} operation:`, errorMsg);
      
      // Stop syncing if too many retries
      if (operation.retries >= 3) {
        console.warn(`⚠️ Operation ${operation.id} exceeded retry limit, keeping in queue`);
      }
    }
  }
  
  // Refresh cache after successful syncs
  if (result.successful > 0) {
    console.log(`🔄 Refreshing cache after ${result.successful} successful syncs...`);
    await refreshAllCaches();
  }
  
  return result;
};

// Refresh all entity caches from server
const refreshAllCaches = async () => {
  const entityTypes = ['chantier', 'personnel', 'vehicule', 'daily-assignment', 'fournisseur', 'stock'] as const;
  const endpoints = ['/chantier', '/personnel', '/vehicule', '/daily-assignment', '/fournisseur', '/stock'];
  
  for (let i = 0; i < entityTypes.length; i++) {
    try {
      const response = await apiClient.get(endpoints[i]);
      const storeName = getStoreName(entityTypes[i]);
      await saveToOfflineStorage(storeName, response.data);
      console.log(`✅ Refreshed cache for ${entityTypes[i]}`);
    } catch (error) {
      console.warn(`⚠️ Failed to refresh cache for ${entityTypes[i]}`, error);
    }
  }
};

// Auto-sync when coming back online
if (typeof window !== 'undefined') {
  window.addEventListener('online', async () => {
    console.log('🌐 Connection restored! Starting auto-sync...');
    
    try {
      const result = await syncQueue();
      
      if (result.total === 0) {
        console.log('ℹ️ No pending operations to sync');
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
      console.error('❌ Auto-sync failed:', error);
    }
  });
}
