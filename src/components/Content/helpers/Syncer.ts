import { CS, get, TabSettings } from "../../../utils/chrome/storage";
import { Message, sendMessageToTab } from "../../../utils/chrome/tabs";
import { toArray } from "../../../utils/general";
import { SIDEBAR_MARGIN, SIDEBAR_MARGIN_Y } from "../Sidebar";
import Point from "./Point";

type SetterMap<J extends string> = Partial<{
  [k in keyof CS | keyof TabSettings[J]]: React.Dispatch<React.SetStateAction<
    k extends keyof TabSettings[J] ? TabSettings[J][k] : k extends keyof CS ? CS[k] : never>
  >
}>;

interface LoadSignatures {
  <K extends string>(key: K, tabId?: string): Promise<{[k in K]: k extends keyof CS ? CS[k] : TabSettings[k]}>;
  <K extends string>(keys: K[], tabId?: string): Promise<{[k in K]: k extends keyof CS ? CS[k] : TabSettings[k]}>;
  <J extends K, K extends string>(keys: Partial<{[k in K]: k extends keyof CS ? CS[k] : TabSettings[k]}>, tabId?: string): Promise<{[j in J]: j extends keyof CS ? CS[j] : TabSettings[j]}>; 
}

export default class Syncer {
  private setterMap: SetterMap<string>;

  public constructor(setterMap: SetterMap<string>) {
    this.setterMap = setterMap;
  }

  public load: LoadSignatures = (keys: any, tabId?: string) => {
    if (tabId) {
      if (typeof keys === 'string') {
        keys = [keys, tabId];
      } else if (Array.isArray(keys)) {
        keys.push(tabId);
      } else {
        keys[tabId] = {
          isOpen: false,
          position: new Point(SIDEBAR_MARGIN, SIDEBAR_MARGIN_Y)
        };
      }
    }

    return get(keys).then((items) => {
      if (tabId && items[tabId]) {
        Object.keys(items[tabId]).forEach((key) => {
          items[key] = items[tabId][key];
        });
      }

      delete items.tabId;
      this.update(items);
      return items;
    });
  }

  public sync = <K extends keyof CS>(message: Message) => {
    const keys: K[] = message.type.split('.').slice(1) as K[];
    if (keys.length === 0) return;
    get(keys).then((items) => this.update(items));
  }

  private update = <J extends string, K extends keyof CS | keyof TabSettings[J]>(items: {[k in K]: k extends keyof CS ? CS[k] : TabSettings[k]}) => {
    Object.keys(items).forEach((key) => {
      if (this.setterMap[key] !== undefined) this.setterMap[key]!(items[key]);
    });
  }
}

/**
 * Enable content scripts to request extension to sync specified state.
 * @param keys 
 */
export const requestSync = <K extends keyof CS>(keys: K | K[]) => {
  const keysList = toArray(keys);
  const type = `sync.${keysList.join('.')}`;
  chrome.runtime.sendMessage({ type });
}

/**
 * Enable extension to trigger sync for given tabs. Message may or may not already be constructed.
 * @param tabs 
 * @param message 
 */
export const triggerSync = <K extends keyof CS>(
  tabs: number | number[] | chrome.tabs.Tab | chrome.tabs.Tab[], 
  message: K | K[] | Message
) => {
  if (typeof message === 'string') {
    message = [message];
  }

  if (typeof message[0] === 'string') {
    const type = `sync.${(message as string[]).join('.')}`;
    message = { type };
  }

  sendMessageToTab(tabs, message as Message);
}
