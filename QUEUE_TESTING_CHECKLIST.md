# 🧪 Offline Queue Testing Checklist

## Pre-Test Setup
- [ ] Backend server running (`cd BEnestjs-main && npm run start:dev`)
- [ ] Frontend server running (`cd FEnextjs-main && npm run dev`)
- [ ] Chrome DevTools open (F12)
- [ ] Database seeded with test data

## Test 1: Basic Offline Queue (Work Sites)

### Go Offline
- [ ] Open Chrome DevTools → Network tab
- [ ] Set throttling to "Offline"
- [ ] Navigate to Work Sites page (`/work-sites`)
- [ ] Verify existing data loads from cache
- [ ] Click "Add New Work Site"

### Create Item Offline
- [ ] Fill form:
  - Name: "Test Site Offline"
  - Location: "Test Location"
  - Status: "Active"
- [ ] Click Save
- [ ] **VERIFY**: Error message shows "📝 Operation queued for sync when online"
- [ ] **VERIFY**: Queue indicator appears at bottom-right
- [ ] **VERIFY**: Shows "1 operation queued (offline)" in yellow/orange

### Go Back Online
- [ ] Set throttling to "No throttling" or "Online"
- [ ] **VERIFY**: Queue indicator changes to green "Syncing 1 pending operation..."
- [ ] **VERIFY**: After 1-2 seconds, see alert "✅ Synced 1 pending changes!"
- [ ] **VERIFY**: Queue indicator disappears
- [ ] **VERIFY**: Refresh page - new work site appears in list
- [ ] **VERIFY**: Backend database has the new work site

## Test 2: Multiple Operations Queue

### Go Offline Again
- [ ] Set throttling to "Offline"

### Create Multiple Items
- [ ] **Personnel**: Add "Test Employee" → See queued message
- [ ] **Vehicles**: Add "Test Vehicle" → See queued message
- [ ] **Suppliers**: Add "Test Supplier" → See queued message
- [ ] **VERIFY**: Queue indicator shows "3 operations queued (offline)"

### Edit Existing Item
- [ ] Find existing work site in list
- [ ] Click Edit
- [ ] Change name to "Updated Offline"
- [ ] Save
- [ ] **VERIFY**: Queue indicator shows "4 operations queued (offline)"

### Delete Item (if you want to test)
- [ ] Find an item to delete
- [ ] Click delete, confirm
- [ ] **VERIFY**: Queue indicator shows "5 operations queued (offline)"

### Sync All
- [ ] Go online (remove throttling)
- [ ] **VERIFY**: Queue indicator shows "Syncing 5 pending operations..."
- [ ] **VERIFY**: Alert shows "✅ Synced 5 pending changes!"
- [ ] **VERIFY**: All changes visible after refresh
- [ ] **VERIFY**: Backend database has all changes

## Test 3: Queue Persistence

### Test Browser Refresh
- [ ] Go offline
- [ ] Create 2 new items (any entity type)
- [ ] **VERIFY**: Queue shows "2 operations queued"
- [ ] Refresh the page (F5)
- [ ] **VERIFY**: Queue indicator still shows "2 operations queued"
- [ ] Go online
- [ ] **VERIFY**: Items sync successfully

### Test Tab Close/Reopen
- [ ] Go offline
- [ ] Create 1 new item
- [ ] Close browser tab completely
- [ ] Reopen http://localhost:3000
- [ ] **VERIFY**: Queue indicator shows "1 operation queued" immediately
- [ ] Go online
- [ ] **VERIFY**: Item syncs

## Test 4: Failed Sync Handling

### Test Invalid Data (Backend Validation)
- [ ] Go offline
- [ ] Try to create work site with:
  - Name: "" (empty - should fail validation)
  - Location: "Test"
- [ ] **VERIFY**: Queue shows "1 operation queued"
- [ ] Go online
- [ ] **VERIFY**: Alert shows "⚠️ 1 operations failed to sync"
- [ ] Open browser console
- [ ] **VERIFY**: See error message about validation

### Check Failed Item in Queue
- [ ] Open DevTools → Application → IndexedDB → GMS_Offline_DB → pending_operations
- [ ] **VERIFY**: Failed operation still in queue with:
  - status: "failed"
  - retries: 1
  - error: validation message

## Test 5: Cache Refresh After Sync

### Verify Cache Updates
- [ ] Go to Work Sites page while online
- [ ] Note current data
- [ ] Go offline
- [ ] Create new work site
- [ ] Go online and wait for sync
- [ ] **Without refreshing page**, navigate away and back
- [ ] **VERIFY**: New work site appears (cache was refreshed)

## Test 6: Multiple Entity Types

### Test All 6 Entity Types
- [ ] Go offline
- [ ] Create one item in each page:
  - [ ] Work Sites (`/work-sites`)
  - [ ] Personnel (`/employees`)
  - [ ] Vehicles (`/vehicles`)
  - [ ] Daily Assignments (`/daily-assignments`)
  - [ ] Suppliers (`/suppliers`)
  - [ ] Stock (`/stock.tsx` - if you have a page)
- [ ] **VERIFY**: Queue shows "6 operations queued"
- [ ] Go online
- [ ] **VERIFY**: All 6 sync successfully
- [ ] **VERIFY**: All items appear in respective pages

## Test 7: UI/UX Experience

### Queue Indicator Visibility
- [ ] **Color**: Yellow/orange when offline, green when syncing
- [ ] **Position**: Bottom-right corner, not blocking content
- [ ] **Auto-hide**: Disappears when queue is empty
- [ ] **Readable**: Text is clear and understandable

### Error Messages
- [ ] Queued operation message includes "📝" emoji
- [ ] Success sync alert includes "✅" emoji
- [ ] Failed sync alert includes "⚠️" emoji
- [ ] Messages are user-friendly (no technical jargon)

## Test 8: Real-World Scenario

### Simulate Foreman on Site
1. **Morning - Online**:
   - [ ] Open app
   - [ ] View all work sites, personnel, vehicles
   - [ ] All data loads successfully

2. **Site Visit - Go Offline** (simulate entering underground/remote area):
   - [ ] Set throttling to Offline
   - [ ] Try to create daily assignment
   - [ ] **VERIFY**: Operation queued

3. **More Offline Work**:
   - [ ] Add fuel cost to daily assignment
   - [ ] Update vehicle status
   - [ ] Add notes to work site
   - [ ] **VERIFY**: All operations queued

4. **Back to Office - Online**:
   - [ ] Remove throttling
   - [ ] **VERIFY**: All changes sync automatically
   - [ ] **VERIFY**: Manager can see all updates

## Debugging Tools

### Check Queue in Console
```javascript
// Get all pending operations
const openDB = indexedDB.open('GMS_Offline_DB', 3);
openDB.onsuccess = (e) => {
  const db = e.target.result;
  const tx = db.transaction('pending_operations', 'readonly');
  const store = tx.objectStore('pending_operations');
  const req = store.getAll();
  req.onsuccess = () => console.table(req.result);
};
```

### Force Manual Sync
```javascript
// In browser console
import { syncQueue } from './utils/syncEngine';
syncQueue().then(console.log);
```

### Clear Queue (Emergency)
```javascript
// Delete all pending operations
const openDB = indexedDB.open('GMS_Offline_DB', 3);
openDB.onsuccess = (e) => {
  const db = e.target.result;
  const tx = db.transaction('pending_operations', 'readwrite');
  const store = tx.objectStore('pending_operations');
  store.clear();
  console.log('Queue cleared');
};
```

## Success Criteria

✅ **All tests pass if**:
1. Operations queue successfully when offline
2. Queue indicator shows accurate count
3. Auto-sync triggers when online
4. All operations sync successfully
5. Failed operations are handled gracefully
6. Cache refreshes after sync
7. Queue persists across page refreshes
8. UI is clear and user-friendly

## Common Issues

| Issue | Solution |
|-------|----------|
| Queue not syncing | Check syncEngine imported in _app.tsx |
| Indicator not showing | Verify QueueIndicator in Layout |
| Operations not queued | Add entityType parameter to API calls |
| Sync fails repeatedly | Check backend validation, network logs |
| Queue indicator stuck | Clear browser cache and reload |

---

**Time to Complete**: ~20-30 minutes  
**Required**: Chrome DevTools, Backend running  
**Difficulty**: Easy to Moderate
