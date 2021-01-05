import { toArray } from "..";
import { ForgotReqBody, LoginReqBody } from "../../app/server/auth";
import { ErrorReqBody } from "../../app/server/misc";
import { CreatePostReqBody } from "../../app/server/posts";
import { UpdateUserReqBody } from "../../app/server/users";

export interface Message {
  type: MessageType;
  id?: string;
  name?: string;
  post?: CreatePostReqBody;
  text?: string;
  url?: string;
  loginArgs?: LoginReqBody;
  error?: ErrorReqBody;
  forgotPasswordArgs?: ForgotReqBody;
  updateUserArgs?: UpdateUserReqBody;
}

export enum MessageType {
  CreatePost,
  CreateReply,
  GetPosts,
  GetTabId,
  HandleUserSearch,
  GetTopics,
  HandleTopicSearch,
  Sync,
  Login,
  Error,
  ForgotPassword,
  UpdateUser,
  LikePost,
  UnlikePost,
}

export interface Response {
  complete: boolean;
}

export const sendMessageToTab = (
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
      // resolve();
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

export const sendMessageToExtension = (message: Message) => {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response: any) => {
      const err = chrome.runtime.lastError;
      if (err) {
        console.error(err);
        reject(err);
      } else {
        // console.log('resolve')
        resolve(response);
      }
    });
  });
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

export const getTabId = (): Promise<string> => {
  return sendMessageToExtension({ type: MessageType.GetTabId })
    .then((id) => id as string);
}
