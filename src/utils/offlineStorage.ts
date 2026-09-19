import { GalleryPhoto } from '../types';

const DB_NAME = 'BirthdayCelebrationMemoriesDB';
const DB_VERSION = 1;
const STORE_NAME = 'offline_photos';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB is not supported on this browser.'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save photos to IndexedDB for permanent offline viewing
 */
export async function savePhotosToOfflineDB(photos: GalleryPhoto[]): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    for (const photo of photos) {
      store.put({
        ...photo,
        cachedOffline: true,
      });
    }

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Failed to save to IndexedDB, fallback to localStorage', err);
    try {
      localStorage.setItem('cached_birthday_photos', JSON.stringify(photos));
    } catch {
      // ignore
    }
  }
}

/**
 * Retrieve cached photos from offline IndexedDB
 */
export async function getOfflinePhotosFromDB(): Promise<GalleryPhoto[]> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch {
    try {
      const stored = localStorage.getItem('cached_birthday_photos');
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return [];
  }
}

/**
 * Convert an image URL into a base64 DataURL so it can be stored and viewed completely offline
 */
export async function cacheImageAsDataUrl(url: string): Promise<string> {
  // If already a base64 data URL, return directly
  if (url.startsWith('data:image/')) return url;

  try {
    const response = await fetch(url, { mode: 'cors' });
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          resolve(url);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read image as Data URL'));
      reader.readAsDataURL(blob);
    });
  } catch {
    // If CORS or offline, return original url as fallback
    return url;
  }
}
