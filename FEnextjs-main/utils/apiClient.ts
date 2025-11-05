// Offline-aware API wrapper for PWA
import axios, { AxiosRequestConfig } from 'axios';
import { saveToOfflineStorage, getFromOfflineStorage, isOnline, getStoreName } from './offlineStorage';
import { addToQueue } from './offlineQueue';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Offline-aware GET request
export const offlineGet = async <T = any>(
  endpoint: string,
  entityType: 'chantier' | 'personnel' | 'vehicule' | 'daily-assignment' | 'stock' | 'order'
): Promise<T[]> => {
  const storeName = getStoreName(entityType);

  try {
    if (isOnline()) {
      // Online: fetch from API and cache
      const response = await apiClient.get<T[]>(endpoint);
      const data = response.data;
      
      // Save to offline storage
      await saveToOfflineStorage(storeName, data);
      
      return data;
    } else {
      // Offline: return cached data
      console.log(`📴 Offline mode: Loading ${entityType} from cache`);
      const cachedData = await getFromOfflineStorage(storeName);
      return cachedData as T[];
    }
  } catch (error) {
    // Network error: fallback to cache
    console.warn(`⚠️ Network error, loading ${entityType} from cache`, error);
    const cachedData = await getFromOfflineStorage(storeName);
    
    if (cachedData.length === 0) {
      throw new Error(`No cached data available for ${entityType}`);
    }
    
    return cachedData as T[];
  }
};

// Standard API methods (for POST, PATCH, DELETE) with offline queue support
export const apiPost = async <T = any>(
  endpoint: string,
  data: any,
  entityType?: 'chantier' | 'personnel' | 'vehicule' | 'daily-assignment' | 'stock' | 'order'
): Promise<T> => {
  if (!isOnline()) {
    // Queue the operation for later sync
    if (entityType) {
      await addToQueue({
        type: 'CREATE',
        entityType,
        endpoint,
        data,
      });
      console.log('📝 Operation queued: CREATE', entityType);
      throw new Error('📝 Operation queued for sync when online');
    }
    throw new Error('❌ Cannot create new items while offline');
  }
  const response = await apiClient.post<T>(endpoint, data);
  return response.data;
};

export const apiPatch = async <T = any>(
  endpoint: string,
  data: any,
  entityType?: 'chantier' | 'personnel' | 'vehicule' | 'daily-assignment' | 'stock' | 'order'
): Promise<T> => {
  if (!isOnline()) {
    // Queue the operation for later sync
    if (entityType) {
      await addToQueue({
        type: 'UPDATE',
        entityType,
        endpoint,
        data,
      });
      console.log('📝 Operation queued: UPDATE', entityType);
      throw new Error('📝 Operation queued for sync when online');
    }
    throw new Error('❌ Cannot update items while offline');
  }
  const response = await apiClient.patch<T>(endpoint, data);
  return response.data;
};

export const apiDelete = async (
  endpoint: string,
  entityType?: 'chantier' | 'personnel' | 'vehicule' | 'daily-assignment' | 'stock' | 'order'
): Promise<void> => {
  if (!isOnline()) {
    // Queue the operation for later sync
    if (entityType) {
      await addToQueue({
        type: 'DELETE',
        entityType,
        endpoint,
      });
      console.log('📝 Operation queued: DELETE', entityType);
      throw new Error('📝 Operation queued for sync when online');
    }
    throw new Error('❌ Cannot delete items while offline');
  }
  await apiClient.delete(endpoint);
};

// Export API client for custom requests
export { apiClient };
export default apiClient;
