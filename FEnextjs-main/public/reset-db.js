// Database Migration Helper
// Run this in browser console to reset IndexedDB with correct schema

console.log('🔄 Starting database migration...');

// Delete old database
const deleteRequest = indexedDB.deleteDatabase('GMS_Offline_DB');

deleteRequest.onsuccess = () => {
  console.log('✅ Old database deleted successfully');
  console.log('🔄 Reloading page to create new database with correct schema...');
  setTimeout(() => {
    location.reload();
  }, 500);
};

deleteRequest.onerror = () => {
  console.error('❌ Failed to delete database');
};

deleteRequest.onblocked = () => {
  console.warn('⚠️ Database deletion blocked. Please close all other tabs with this site and try again.');
  alert('Please close all other tabs with localhost:3000 and refresh this page.');
};
