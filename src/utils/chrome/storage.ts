import Point from '../../components/Content/helpers/Point';
import { User } from '../../models/nodes/User';


/**
 * Key to type mapping. For the love of god can Typescript implement negated types? Merge CS and
 * TabSettings when they do.
 */
export interface CS {
  isAuthenticated: boolean;
  isExtensionOn: boolean;
  user: User;
}

export interface TabSettings {
  [tabId: string]: {
    isOpen?: boolean;
    position?: Point;
  };
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
export function get<K extends string>(key: K, area?: AreaName): Promise<{[k in K]: k extends keyof CS ? CS[k] : TabSettings[k]}>;
export function get<K extends string>(key: K[], area?: AreaName): Promise<{[k in K]: k extends keyof CS ? CS[k] : TabSettings[k]}>;
export function get<J extends K, K extends string>(key: Partial<{[k in K]: k extends keyof CS ? CS[k] : TabSettings[k]}>, area?: AreaName): Promise<{[j in J]: j extends keyof CS ? CS[j] : TabSettings[j]}>;
export function get<K extends string>(key: K | K[] | Partial<{[k in K]: k extends keyof CS ? CS[k] : TabSettings[k]}>, area: AreaName='local') {
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
export function get1<K extends string>(key: K, area?: AreaName) {
  return get(key, area).then((items) => items[key]);
}

/**
 * Set given key-value pairs in chrome storage.
 * TODO: typing isn't perfect, can pair keyof CS with value of TabSetting
 * @param items
 * @param area 
 */
export function set<K extends keyof CS, J extends string>(items: Partial<{[k in K]: CS[k]}> | {[key: string]: Partial<TabSettings[J]>}, area: AreaName='local'): Promise<void> {
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
 * TODO: remove string from key type when we can combine CS and TabSettings
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
 * Remove data associated with given tab id from chrome storage. 
 * 
 * This is separate from `remove` to keep strong typing provied by `CS`.
 * @param tabId 
 */
export const removeTabInfo = (tabId: string, area: AreaName='local') => {
  remove(tabId as keyof CS, area);
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
