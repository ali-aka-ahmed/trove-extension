
/**
 * Key to type mapping. For the love of god can Typescript implement negated types? Merge CS and
 * TabSettings when they do.
 */
// export interface CS {
//   isAuthenticated: boolean;
//   isExtensionOn: boolean;
//   token: string;
//   user: IUser;
// }

// export interface TabSettings {
//   [tabId: string]: {
//     isOpen?: boolean;
//     position?: Point;
//   };
// }

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
export function get(
  key: null | string | string[] | {[key: string]: any}, 
  area: AreaName='local'
): Promise<{[key: string]: any}> {
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
export function get1(key: string, area?: AreaName): any {
  return get(key, area).then((items) => items[key]);
}

/**
 * Set given key-value pairs in chrome storage.
 * TODO: typing isn't perfect, can pair keyof CS with value of TabSetting
 * @param items
 * @param area 
 */
export function set(items: {[key: string]: any}, area: AreaName='local'): Promise<void> {
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
export function remove(keys: string | string[], area: AreaName='local'): Promise<void> {
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

/**
 * Get key for given tab and property.
 * @param tabId 
 * @param prop 
 */
export const key = (tabId: string, prop: string): string => {
  return tabId + '.' + prop;
}
