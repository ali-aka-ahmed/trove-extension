import { User } from '../../common';
import Point from '../../components/Content/helpers/Point';

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
 * Get values corresponding to given keys from chrome storage. This method takes in a single key, 
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
export function get<K extends keyof CS>(key: null, area?: AreaName): Promise<{[k in K]: CS[k]}>;
export function get<K extends keyof CS>(key: K, area?: AreaName): Promise<{[key in K]: CS[key]}>;
export function get<K extends keyof CS>(key: K[], area?: AreaName): Promise<{[key in K]: CS[key]}>;
export function get<J extends K, K extends keyof CS>(key: Partial<{[k in K]: CS[k]}>, area?: AreaName): Promise<{[j in J]: CS[j]}>;
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
 * Get value corresponding to given key.
 * @param key 
 * @param area 
 */
export function get1<K extends keyof CS>(key: K, area: AreaName='local'): Promise<CS[K]> {
  return get(key, area).then((items) => items[key]);
}

/**
 * Set given key-value pairs in chrome storage.
 * @param items
 * @param area 
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
 * Remove given key or list of keys from chrome storage.
 * @param keys
 * @param area 
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
 * Clear chrome storage.
 * @param area 
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
