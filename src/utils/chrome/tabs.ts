import { toArray } from '..';
import { ForgotReqBody, LoginReqBody } from '../../app/server/auth';
import { ErrorReqBody } from '../../app/server/misc';
import { CreateCommentReqBody, CreatePostReqBody } from '../../app/server/posts';
import { UpdateUserReqBody } from '../../app/server/users';

export interface Message {
  type: MessageType | SocketMessageType;
  error?: ErrorReqBody;
  forgotPasswordArgs?: ForgotReqBody;
  id?: string;
  parentPostId?: string;
  loginArgs?: LoginReqBody;
  name?: string;
  notificationId?: string;
  numResults?: number;
  post?: CreatePostReqBody;
  comment?: CreateCommentReqBody;
  text?: string;
  textPrefix?: string;
  updateUserArgs?: UpdateUserReqBody;
  url?: string;
  userId?: string;
  usernamePrefix?: string;
  active?: boolean;
  query?: string;
  spaceId?: string;
  limit?: number;
  recentIds?: string[];
  width?: number;
}

export enum MessageType {
  CreateComment,
  CreatePost,
  Error,
  ForgotPassword,
  GetNotionAuthToken,
  GetPosts,
  GetTabId,
  HandleTopicSearch,
  HandleUserSearch,
  LikePost,
  Login,
  Sync,
  UnlikePost,
  UpdateUser,
  OpenTab,
  DeletePost,
  GoToPage,
  GetNotionPages,
  SearchNotionPages,
  GetNotionImage,
}

/**
 * Make sure this stays in sync with backend
 */
export enum SocketMessageType {
  NotificationTrayOpened = 'Notification Tray Opened',
  LeaveRoom = 'Leave Room',
  JoinRoom = 'Join Room',
  ReadNotification = 'Read Notification',
  Notifications = 'Notifications',
  Notification = 'Notification',
}

export const sendMessageToExtension = (message: Message) => {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response: any) => {
      const err = chrome.runtime.lastError;
      if (err) {
        console.error(err);
        reject(err);
      } else {
        resolve(response);
      }
    });
  });
};

export interface Response {
  complete: boolean;
}

export const sendMessageToTab = (
  tab: number | number[] | chrome.tabs.Tab | chrome.tabs.Tab[],
  message: Message,
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

  const promises = tabIds.map(
    (tabId) =>
      new Promise((resolve, reject) => {
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
      }),
  );

  return Promise.all(promises);
};

export const getActiveTabs = (): Promise<chrome.tabs.Tab[]> => {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true }, (tabs: chrome.tabs.Tab[]) => {
      resolve(tabs);
    });
  });
};

export const getAllTabs = (): Promise<chrome.tabs.Tab[]> => {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({}, (tabs: chrome.tabs.Tab[]) => {
      resolve(tabs);
    });
  });
};

export const getTabId = (): Promise<string> => {
  return sendMessageToExtension({ type: MessageType.GetTabId }).then((id) => id as string);
};
