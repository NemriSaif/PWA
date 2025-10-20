// ULTRA-SIMPLE SYNC ENGINE - NO FANCY FEATURES
// Direct IndexedDB access, no imports that could cause issues

const DB_NAME = 'GMS_Offline_DB';
const API_URL = 'http://localhost:3001';

// Open IndexedDB directly
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 4);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Get pending operations
async function getPendingOps() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pending_operations', 'readonly');
    const store = tx.objectStore('pending_operations');
    const request = store.getAll();
    request.onsuccess = () => {
      const all = request.result;
      resolve(all.filter(op => op.status === 'pending'));
    };
    request.onerror = () => reject(request.error);
  });
}

// Remove operation from queue
async function removeOp(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pending_operations', 'readwrite');
    const store = tx.objectStore('pending_operations');
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Update operation status
async function updateOpStatus(id, status, error) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pending_operations', 'readwrite');
    const store = tx.objectStore('pending_operations');
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      const op = getReq.result;
      if (op) {
        op.status = status;
        if (error) op.error = error;
        const putReq = store.put(op);
        putReq.onsuccess = () => resolve();
        putReq.onerror = () => reject(putReq.error);
      } else {
        resolve();
      }
    };
    getReq.onerror = () => reject(getReq.error);
  });
}

// Simple fetch wrapper
async function doFetch(endpoint, method, data) {
  const url = API_URL + endpoint;
  const opts = {
    method: method,
    headers: { 'Content-Type': 'application/json' }
  };
  
  if (data) {
    opts.body = JSON.stringify(data);
  }
  
  const res = await fetch(url, opts);
  
  if (!res.ok) {
    throw new Error('Request failed');
  }
  
  if (method !== 'DELETE') {
    return await res.json();
  }
}

// Main sync function
export async function simpleSync() {
  console.log('🔄 Starting simple sync...');
  
  const ops = await getPendingOps();
  console.log('Found operations:', ops.length);
  
  let success = 0;
  let failed = 0;
  
  for (let i = 0; i < ops.length; i++) {
    const op = ops[i];
    
    try {
      console.log('Syncing:', op.type, op.entityType);
      await updateOpStatus(op.id, 'syncing');
      
      if (op.type === 'CREATE') {
        await doFetch(op.endpoint, 'POST', op.data);
      } else if (op.type === 'UPDATE') {
        await doFetch(op.endpoint, 'PATCH', op.data);
      } else if (op.type === 'DELETE') {
        await doFetch(op.endpoint, 'DELETE');
      }
      
      await removeOp(op.id);
      success = success + 1;
      console.log('✅ Synced');
      
    } catch (err) {
      console.error('❌ Failed:', err);
      await updateOpStatus(op.id, 'failed', String(err));
      failed = failed + 1;
    }
  }
  
  console.log('Sync complete:', success, 'success,', failed, 'failed');
  
  if (success > 0) {
    alert('✅ Synced ' + success + ' operations!');
  }
  if (failed > 0) {
    alert('⚠️ ' + failed + ' operations failed');
  }
}

// Auto-sync on online
if (typeof window !== 'undefined') {
  window.addEventListener('online', function() {
    console.log('🌐 Back online!');
    simpleSync();
  });
}
