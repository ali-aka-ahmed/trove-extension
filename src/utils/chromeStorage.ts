import Point from '../components/content/sidebar/Point';

/**
 * Get values corresponding to given keys from local storage. This method takes in a single key, 
 * a list of keys, or an object containing the keys mapped to their default values, and returns a
 * promise which returns an object containing the key-value pairs retrieved from storage. `null` 
 * can be passed in to retrieve all stored key-value pairs.
 * 
 * Sample usage:
 * ```
 * csGet('key').then(items => items.key);
 * csGet({ key: 'hello' }).then(items => items.key);
 * csGet(null).then(allItems => allItems.someKey);
 * ```
 * 
 * @param key
 */
export function csGet(key: null): Promise<CS>;
export function csGet<K extends keyof CS>(key: K | K[]): Promise<{[key in K]: CS[key]}>;
export function csGet<J extends K, K extends keyof CS>(key: {[k in K]: CS[k]}): Promise<{[j in J]: CS[j]}>;
export function csGet<K extends keyof CS>(key: K | K[] | {[k in K]: CS[k]}) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(key, (items) => {
      const err = chrome.runtime.lastError;
      if (err) {
        console.error(err.message);
        reject(err.message);
      } else {
        resolve(items);
      }
    });
  });
}

/**
 * Write given key-value pair to local storage. Returns whether or not write
 * was successful. Any thrown errors are suppressed and redirected to console.
 * @param key 
 * @param val 
 */
export function csWrite<K extends keyof CS>(key: K, val: CS[K]): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(val));
    return true;
  } catch(err) {
    console.error(`Failed to write ${key} to local storage. Error: ${err}`);
    return false;
  }
}

/**
 * Remove key-value pair with given key from local storage.
 * @param key 
 */
export function csDelete<K extends keyof CS>(keys: K | K[]): void {
  const keyList = toArray(keys);
  for (const key of keyList) localStorage.removeItem(key);
}

/**
 * Key to type mapping.
 */
export interface CS {
  extensionOn: boolean;
  loggedIn: boolean;
  sidebarPosition: Point;
  sidebarOpen: boolean;
}
