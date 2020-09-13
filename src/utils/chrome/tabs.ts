import { toArray } from "../general";

export interface Message {
  type: string;
}

export interface Response {
  complete: boolean;
}

export const sendMessage = (
  tab: number | number[] | chrome.tabs.Tab | chrome.tabs.Tab[],
  message: Message
) => {
  const tabList = toArray(tab);
  let tabIds: number[] = [];
  if (tabList.length > 0 && typeof tabList[0] !== 'number') {
    (tabList as chrome.tabs.Tab[]).forEach((tab) => {
      if (tab.id) tabIds.push(tab.id);
    });
  } else {
    tabIds = tabList as number[];
  }

  const promises = tabIds.map((tabId) => new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, message, (response: Response) => {
      resolve();
      // if (response.complete) {
      //   console.log('sent message', message, tabId)
      //   resolve();
      // } else {
      //   const err = `Failed to send message ${message.type} to tab ${tabId}.`;
      //   console.error(err);
      //   reject(err);
      // }
    });
  }));
  
  return Promise.all(promises);
}

export const getActiveTabs = (): Promise<chrome.tabs.Tab[]> => {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true }, (tabs: chrome.tabs.Tab[]) => {
      resolve(tabs);
    });
  });
}

export const getAllTabs = (): Promise<chrome.tabs.Tab[]> => {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({}, (tabs: chrome.tabs.Tab[]) => {
      resolve(tabs);
    });
  });
}
