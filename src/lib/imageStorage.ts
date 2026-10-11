'use client';

/**
 * IndexedDB thumbnail storage for EcoVision AI.
 * Keeps large image binary/base64 data completely out of localStorage.
 */

const DB_NAME = 'ecovision_media_store';
const STORE_NAME = 'scan_thumbnails';
const DB_VERSION = 1;

function isIndexedDBSupported(): boolean {
  return typeof window !== 'undefined' && 'indexedDB' in window && window.indexedDB !== null;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!isIndexedDBSupported()) {
      return reject(new Error('IndexedDB not supported'));
    }

    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error || new Error('Failed to open IndexedDB'));
      };

      request.onblocked = () => {
        console.warn('IndexedDB blocked by another open tab');
      };
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Save an image thumbnail in IndexedDB by scan ID.
 * Returns true on success, false on failure (never throws).
 */
export async function saveThumbnail(id: string, dataUrl: string): Promise<boolean> {
  if (!id || !dataUrl || !isIndexedDBSupported()) return false;

  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      try {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put({ id, dataUrl, createdAt: Date.now() });

        request.onsuccess = () => resolve(true);
        request.onerror = () => {
          console.warn('Failed to store thumbnail in IndexedDB:', request.error);
          resolve(false);
        };
        transaction.oncomplete = () => db.close();
      } catch (e) {
        console.warn('Error in IndexedDB transaction:', e);
        resolve(false);
      }
    });
  } catch (err) {
    console.warn('Unable to access IndexedDB for saving thumbnail:', err);
    return false;
  }
}

/**
 * Retrieve a thumbnail data URL by scan ID.
 * Returns the data URL or null if not found/unavailable.
 */
export async function getThumbnail(id: string): Promise<string | null> {
  if (!id || !isIndexedDBSupported()) return null;

  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      try {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(id);

        request.onsuccess = () => {
          if (request.result && request.result.dataUrl) {
            resolve(request.result.dataUrl);
          } else {
            resolve(null);
          }
        };

        request.onerror = () => {
          resolve(null);
        };

        transaction.oncomplete = () => db.close();
      } catch {
        resolve(null);
      }
    });
  } catch {
    return null;
  }
}

/**
 * Delete a thumbnail from IndexedDB.
 */
export async function deleteThumbnail(id: string): Promise<void> {
  if (!id || !isIndexedDBSupported()) return;

  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      try {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => resolve();
        transaction.oncomplete = () => db.close();
      } catch {
        resolve();
      }
    });
  } catch {
    // Non-blocking cleanup
  }
}

/**
 * Clear all thumbnails from IndexedDB.
 */
export async function clearAllThumbnails(): Promise<void> {
  if (!isIndexedDBSupported()) return;

  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      try {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => resolve();
        transaction.oncomplete = () => db.close();
      } catch {
        resolve();
      }
    });
  } catch {
    // Non-blocking cleanup
  }
}
