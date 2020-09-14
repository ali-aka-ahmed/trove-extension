import Point from '../../components/Content/Sidebar/Point';
import { User } from '../../models';

/**
 * Key to type mapping.
 */
export interface CS {
  isAuthenticated: boolean;
  isExtensionOn: boolean;
  isOpen: boolean;
  position: Point;
  user: User;
}

type AreaName = 'local' | 'sync' | 'managed';

/**
 * Get values corresponding to given keys from local storage. This method takes in a single key, 
 * a list of keys, or an object containing the keys mapped to their default values, and returns a
 * promise which returns an object containing the key-value pairs retrieved from storage. `null` 
 * can be passed in to retrieve all stored key-value pairs.
 * 
 * Sample usage:
 * ```
 * get('key').then(items => items.key);
 * get({ key: 'hello' }).then(items => items.key);
 * get(null).then(allItems => allItems.someKey);
 * ```
 * 
 * @param key
 * @param area
 */
export function get<K extends keyof CS>(key: null): Promise<{[k in K]: CS[k]}>;
export function get<K extends keyof CS>(key: K): Promise<{[key in K]: CS[key]}>;
export function get<K extends keyof CS>(key: K[]): Promise<{[key in K]: CS[key]}>;
export function get<J extends K, K extends keyof CS>(key: Partial<{[k in K]: CS[k]}>): Promise<{[j in J]: CS[j]}>;
export function get<K extends keyof CS>(key: K | K[] | Partial<{[k in K]: CS[k]}>, area: AreaName='local') {
  return new Promise((resolve, reject) => {
    chrome.storage[area].get(key, (items) => {
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
export function set<K extends keyof CS>(items: Partial<{[k in K]: CS[k]}>, area: AreaName='local'): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage[area].set(items, () => {
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
export function remove<K extends keyof CS>(keys: K | K[], area: AreaName='local'): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage[area].remove(keys, () => {
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
export function clear(area: AreaName='local'): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage[area].clear(() => {
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
