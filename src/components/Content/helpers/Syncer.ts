import { CS, get } from "../../../utils/chrome/storage";
import { Message, sendMessage } from "../../../utils/chrome/tabs";
import { toArray } from "../../../utils/general";

type SetterMap = {[k in keyof Partial<CS>]: React.Dispatch<React.SetStateAction<CS[k]>>};

export default class Syncer {
  private setterMap: SetterMap;

  public constructor(setterMap: SetterMap) {
    this.setterMap = setterMap;
  }

  public sync = <K extends keyof CS>(message: Message) => {
    const keys: K[] = message.type.split('.').slice(1) as K[];
    if (keys.length === 0) return;
    get(keys).then((items) => {
      keys.forEach((key) => {
        if (this.setterMap[key] !== undefined) this.setterMap[key]!(items[key] as any);
      });
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

  sendMessage(tabs, message as Message);
}
