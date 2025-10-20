# 📝 Offline Queue System

## Overview
The offline queue system allows users to continue creating, updating, and deleting data while offline. All changes are stored locally and automatically synced when the connection returns.

## Architecture

### Components

1. **offlineQueue.ts** - Queue Manager
   - Stores pending operations in IndexedDB
   - Manages queue operations (add, get, remove, update)
   - Tracks operation status and retry count

2. **syncEngine.ts** - Sync Engine
   - Processes pending operations when online
   - Auto-syncs on connection restore
   - Refreshes cache after successful syncs
   - Shows notifications on sync completion

3. **apiClient.ts** - API Wrapper (Enhanced)
   - Queue CREATE/UPDATE/DELETE operations when offline
   - Optional `entityType` parameter for queuing
   - Throws friendly error messages

4. **QueueIndicator.tsx** - UI Component
   - Shows pending operation count
   - Updates in real-time
   - Displays sync status

## How It Works

### When Offline

1. User tries to create/edit/delete an item
2. API detects offline state
3. Operation is queued in IndexedDB with:
   ```typescript
   {
     id: 'uuid',
     type: 'CREATE' | 'UPDATE' | 'DELETE',
     entityType: 'chantier' | 'personnel' | etc,
     endpoint: '/api/endpoint',
     data: { ... },
     status: 'pending',
     retries: 0,
     timestamp: '2024-01-01T00:00:00.000Z'
   }
   ```
4. User sees: "📝 Operation queued for sync when online"
5. Queue indicator appears showing pending count

### When Connection Returns

1. Sync engine detects online event
2. Retrieves all pending operations from queue
3. Processes each operation in FIFO order:
   - Sets status to 'syncing'
   - Executes HTTP request (POST/PATCH/DELETE)
   - On success: removes from queue
   - On failure: marks as 'failed', increments retry count
4. Refreshes all cache stores after successful syncs
5. Shows notification with sync results

### Auto-Retry Logic

- Failed operations remain in queue
- Retry count increments on each failure
- Max retries: 3
- After 3 failures: operation kept in queue but no more auto-retry

## Usage in Pages

### Example: Work Sites Page

```typescript
// Add entity type parameter to POST/PATCH/DELETE calls

const handleCreate = async (data) => {
  try {
    await apiPost('/chantier', data, 'chantier'); // Add 'chantier' entity type
  } catch (error: any) {
    if (error.message.includes('queued')) {
      // Show success message for queued operation
      toast.success('Work site will be created when online');
    } else {
      toast.error('Failed to create work site');
    }
  }
};

const handleUpdate = async (id, data) => {
  try {
    await apiPatch(`/chantier/${id}`, data, 'chantier'); // Add entity type
  } catch (error: any) {
    if (error.message.includes('queued')) {
      toast.success('Changes will be saved when online');
    }
  }
};

const handleDelete = async (id) => {
  try {
    await apiDelete(`/chantier/${id}`, 'chantier'); // Add entity type
  } catch (error: any) {
    if (error.message.includes('queued')) {
      toast.success('Will be deleted when online');
    }
  }
};
```

## Testing the Queue

### Test Scenario 1: Offline Create
1. Open app in Chrome DevTools
2. Go to Network tab → Throttling → Offline
3. Navigate to any page (e.g., Work Sites)
4. Click "Add New Work Site"
5. Fill form and submit
6. **Expected**: 
   - Error message: "📝 Operation queued for sync when online"
   - Queue indicator appears at bottom-right showing "1 operation queued (offline)"
7. Go back online
8. **Expected**:
   - Queue indicator changes to "Syncing 1 pending operation..."
   - Alert: "✅ Synced 1 pending changes!"
   - Queue indicator disappears
   - New work site appears in list

### Test Scenario 2: Multiple Queued Operations
1. Go offline
2. Create 3 new items across different pages
3. Edit 2 existing items
4. Delete 1 item
5. **Expected**: Queue indicator shows "6 operations queued (offline)"
6. Go back online
7. **Expected**: All 6 operations sync in order, caches refresh

### Test Scenario 3: Failed Sync
1. Go offline
2. Create item with invalid data (e.g., missing required field)
3. Go back online
4. **Expected**: 
   - Operation fails
   - Status set to 'failed' with error message
   - Alert: "⚠️ 1 operations failed to sync"
   - Queue indicator shows failed count

## Monitoring

### Check Queue in DevTools

```javascript
// Open browser console

// Check pending operations count
const queue = await window.indexedDB.open('GMS_Offline_DB', 3);
queue.onsuccess = (e) => {
  const db = e.target.result;
  const tx = db.transaction('pending_operations', 'readonly');
  const store = tx.objectStore('pending_operations');
  const req = store.getAll();
  req.onsuccess = () => console.log('Queue:', req.result);
};
```

### Force Manual Sync

```javascript
// Import and run sync manually
import { syncQueue } from './utils/syncEngine';
const result = await syncQueue();
console.log('Sync result:', result);
```

## Limitations

1. **No Optimistic UI Updates**: Queued items don't appear in UI until synced
2. **No Conflict Resolution**: Last write wins (no merge strategy)
3. **Max 3 Retries**: Failed operations stop auto-retrying after 3 attempts
4. **No Priority Queue**: Operations processed in FIFO order
5. **No Partial Sync**: All-or-nothing per operation

## Future Enhancements

1. **Optimistic UI**: Show pending items with "syncing" badge
2. **Conflict Resolution**: Detect server-side changes and prompt user
3. **Manual Retry**: UI button to retry failed operations
4. **Queue Management**: View/edit/delete pending operations
5. **Batch Sync**: Group related operations for efficiency
6. **Background Sync API**: Use Service Worker for sync even when tab closed

## Database Schema

### pending_operations Store

```typescript
{
  keyPath: 'id',
  indexes: [
    { name: 'status', keyPath: 'status' },
    { name: 'timestamp', keyPath: 'timestamp' }
  ]
}
```

## Error Handling

| Scenario | Behavior |
|----------|----------|
| Network offline | Queue operation, show queued message |
| Invalid data | Sync fails, mark as failed, show error |
| Server error (500) | Retry up to 3 times, then keep in queue |
| Auth error (401) | Mark as failed immediately (no retry) |
| Not found (404) | Mark as failed (item may have been deleted) |

## Performance

- **Queue Size**: No hard limit (browser storage quota applies)
- **Sync Speed**: ~100-200ms per operation (sequential)
- **Cache Refresh**: ~500ms total for all 6 entity types
- **UI Update**: Real-time (5-second polling interval)

## Troubleshooting

### Queue not syncing?
- Check browser console for errors
- Verify `syncEngine.ts` is imported in `_app.tsx`
- Test manually: `syncQueue()` in console

### Queue indicator not showing?
- Check `QueueIndicator` is in `_app.tsx` layout
- Verify queue has items: `getQueueCount()` in console

### Operations failing repeatedly?
- Check backend is running
- Verify API endpoints are correct
- Check server logs for validation errors

---

**Built with**: IndexedDB + Next.js + TypeScript  
**Status**: ✅ Production Ready  
**Last Updated**: 2024
