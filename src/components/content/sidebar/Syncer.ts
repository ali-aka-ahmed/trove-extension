import { CS, get } from "../../../utils/chrome/storage";
import { Message, sendMessage } from "../../../utils/chrome/tabs";

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

export const triggerSync = <K extends keyof CS>(
  tabs: number | number[] | chrome.tabs.Tab | chrome.tabs.Tab[], 
  keys: K[]
) => {
  const type = `sync.${keys.join('.')}`;
  sendMessage(tabs, { type });
}
