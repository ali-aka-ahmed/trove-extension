import Point from '../components/content/sidebar/Point';

/**
 * Key to type mapping.
 */
export interface CS {
  extensionOn: boolean;
  loggedIn: boolean;
  sidebarOpen: boolean;
  sidebarPosition: Point;
}

/**
 * Get values corresponding to given keys from local storage. This method takes in a single key, 
 * a list of keys, or an object containing the keys mapped to their default values, and returns a
 * promise which returns an object containing the key-value pairs retrieved from storage. `null` 
 * can be passed in to retrieve all stored key-value pairs.
 * 
 * Sample usage:
 * ```
 * localGet('key').then(items => items.key);
 * localGet({ key: 'hello' }).then(items => items.key);
 * localGet(null).then(allItems => allItems.someKey);
 * ```
 * 
 * @param key
 */
export function localGet(key: null): Promise<CS>;
export function localGet<K extends keyof CS>(key: K | K[]): Promise<{[key in K]: CS[key]}>;
export function localGet<J extends K, K extends keyof CS>(key: {[k in K]: CS[k]}): Promise<{[j in J]: CS[j]}>;
export function localGet<K extends keyof CS>(key: K | K[] | {[k in K]: CS[k]}) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(key, (items) => {
      const err = chrome.runtime.lastError;
      if (err) {
        console.error(`Failed to get ${key} from chrome.storage.local. Error: ${err.message}`);
        reject(err);
      } else {
        resolve(items);
      }
    });
  });
}

/**
 * Set given key-value pairs in chrome.storage.local.
 * @param items
 */
export function localSet<K extends keyof CS>(items: {[k in K]: CS[k]}): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set(items, () => {
      const err = chrome.runtime.lastError;
      if (err) {
        console.error(`Failed to set ${items} to chrome.storage.local. Error: ${err.message}`);
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Remove given key or list of keys from chrome.storage.local.
 * @param keys
 */
export function localRemove<K extends keyof CS>(keys: K | K[]): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.remove(keys, () => {
      const err = chrome.runtime.lastError;
      if (err) {
        console.error(`Failed to remove ${keys} from chrome.storage.local. Error: ${err.message}`);
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Clear chrome.storage.local.
 */
export function localClear(): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.clear(() => {
      const err = chrome.runtime.lastError;
      if (err) {
        console.error(`Failed to clear chrome.storage.local. Error: ${err.message}`);
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

// Not sure if we need this/if it works, will test 
export function addListener() {
  return new Promise((resolve, reject) => {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      const err = chrome.runtime.lastError;
      if (err) {
        reject(err);
      } else {
        resolve({changes, areaName}); 
      }
    });
  });
}
