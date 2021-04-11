import Analytics from 'analytics-node';
import { v4 as uuid } from 'uuid';
import { Record } from '../app/notionTypes';
import { ORIGIN } from '../config';
import User from '../entities/User';
import { analytics as analyticsWrapper } from '../utils/analytics';
import { sendMessageToWebsite } from '../utils/chrome/external';
import { get, get1, set } from '../utils/chrome/storage';
import {
  ExternalMessageType,
  Message,
  MessageType,
  sendMessageToExtension,
  SocketMessageType,
} from '../utils/chrome/tabs';
import getImage from './notionServer/getImage';
import getSpaces, { GetSpacesRes } from './notionServer/getSpaces';
import getSpaceUsers from './notionServer/getSpaceUsers';
import { forgotPassword, login } from './server/auth';
import {
  addEntryToDB,
  addTextToNotion,
  getDBSchema,
  getNotionPages,
  searchNotionPages,
} from './server/notion';
import {
  createComment,
  createPosts,
  deletePostAndChildren,
  getPosts,
  likePost,
  unlikePost,
} from './server/posts';
import { searchTopics } from './server/search';
import { handleUserSearch, updateUser } from './server/users';

const analytics = new Analytics('S1C1XFBTbCgk2owAf6HqNM09C8YdFM6j');

// export const socket = io.connect(BACKEND_URL);

// socket.on('connect', () => {
//   get1('isAuthenticated').then((isAuthenticated) => {
//     if (isAuthenticated) {
//       get1('user').then((user) => {
//         if (user?.id) socket.emit(SocketMessageType.JoinRoom, user.id);
//       });
//     }
//   });
// });

// socket.on(
//   SocketMessageType.Notifications,
//   (notifications: INotification[], notificationDisplayIcon: number) => {
//     set({
//       notifications,
//       notificationDisplayIcon,
//     });
//   },
// );

// socket.on(SocketMessageType.Notification, (n: Notification) => {
//   get({
//     notifications: [],
//     notificationDisplayIcon: 0,
//   }).then((vals) => {
//     const newNotifications = [n].concat(vals.notifications);
//     const popupOpen = chrome.extension.getViews({ type: 'popup' }).length !== 0;
//     if (!popupOpen) {
//       const notificationDisplayIcon = vals.notificationDisplayIcon + 1;
//       set({
//         notifications: newNotifications,
//         notificationDisplayIcon,
//       });
//     } else set({ notifications: newNotifications });
//   });
// });

// // Listener to detect disconnect
// chrome.runtime.onConnect.addListener((port) => {
//   console.log('connected to port', port);
// });

// Messages sent from extension
chrome.runtime.onMessage.addListener(
  (
    message: Message,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: any) => void,
  ) => {
    switch (message.type) {
      case MessageType.Analytics: {
        if (!message.data || !message.data.userId || !message.data.eventName) break;
        analytics.identify({
          userId: message.data.userId as string,
          ...(message.data.userTraits ? { traits: message.data.userTraits } : {}),
        });
        analytics.track({
          event: message.data.eventName as string,
          ...(message.data.userId ? { userId: message.data.userId } : { anonymousId: uuid() }),
          ...(message.data.eventProperties ? { properties: message.data.eventProperties } : {}),
        });
      }
      case MessageType.Login: {
        if (!message.loginArgs) break;
        Promise.all([login(message.loginArgs), getSpaces()])
          .then(([loginRes, getSpacesRes]) => {
            if (getSpacesRes.success) {
              getSpacesRes.notionUserIds.forEach((notionUserId) => {
                // set recents and defaults
                getNotionPages(null, null, notionUserId).then((res) => {
                  if (res.success) {
                    // set defaults
                    if (res.defaults) {
                      set({ notionDefaults: res.defaults });
                    }
                    // set recents
                    get1('notionRecents').then(
                      (notionRecents: { [spaceId: string]: Record[] } | undefined) => {
                        if (res.spaces && res.spaces.length > 0 && res.results) {
                          const recents = notionRecents || {};
                          res.spaces.forEach((s: Record) => {
                            recents[s.id] = res.results![s.id].recents || [];
                          });
                          set({ notionRecents: recents });
                        }
                      },
                    );
                  }
                });

                // set spaceId, notionUserId, spaceUsers and spaceBots
                getNotionPages().then((res) => {
                  if (res.success && res.spaces) {
                    const space = res.spaces[0];
                    const spaceId = space?.id;
                    const userId = space?.userId;
                    set({ spaceId, notionUserId: userId });
                    analyticsWrapper('Set Workspace', null, {
                      spaceId: space?.id,
                      spaceName: space?.name,
                      spaceEmail: space?.email,
                    });
                    getSpaceUsers(spaceId).then((res) => {
                      if (res.success) {
                        set({
                          spaceUsers: res.users,
                          spaceBots: res.bots,
                        });
                      }
                    });
                  }
                });
              });
            }
            return loginRes;
          })
          .then((loginRes) => {
            sendResponse(loginRes);
          });
        break;
      }
      case MessageType.ForgotPassword: {
        if (!message.forgotPasswordArgs) break;
        forgotPassword(message.forgotPasswordArgs).then((res) => {
          sendResponse(res);
        });
        break;
      }
      case MessageType.UpdateUser: {
        if (!message.updateUserArgs) break;
        updateUser(message.updateUserArgs).then((res) => {
          sendResponse(res);
        });
        break;
      }
      case MessageType.CreatePosts: {
        if (!message.posts) break;
        createPosts(message.posts).then((res) => {
          sendResponse(res);
        });
        break;
      }
      case MessageType.CreateComment: {
        if (!message.parentPostId || !message.comment) break;
        createComment(message.parentPostId, message.comment).then((res) => {
          sendResponse(res);
        });
        break;
      }
      case MessageType.GetPosts: {
        if (!message.url) break;
        getPosts(message.url).then((res) => {
          sendResponse(res);
        });
        break;
      }
      case MessageType.LikePost: {
        if (!message.id) break;
        likePost(message.id).then((res) => {
          sendResponse(res);
        });
        break;
      }
      case MessageType.UnlikePost: {
        if (!message.id) break;
        unlikePost(message.id).then((res) => {
          sendResponse(res);
        });
        break;
      }
      case MessageType.GetTabId:
        sendResponse(sender.tab?.id);
        break;
      case MessageType.HandleUserSearch: {
        if (!message.usernamePrefix || !message.numResults) return;
        handleUserSearch({
          usernamePrefix: message.usernamePrefix,
          numResults: message.numResults,
        }).then((res) => {
          sendResponse(res);
        });
        break;
      }
      case MessageType.HandleTopicSearch: {
        searchTopics({
          ...(message.textPrefix ? { textPrefix: message.textPrefix } : {}),
          ...(message.numResults ? { numResults: message.numResults } : {}),
        }).then((res) => {
          sendResponse(res);
        });
        break;
      }
      case MessageType.DeletePost: {
        if (!message.id) break;
        deletePostAndChildren(message.id).then((res) => {
          sendResponse(res);
        });
        break;
      }
      case MessageType.GetNotionUserIds: {
        getSpaces().then((res) => {
          sendResponse(res);
        });
        break;
      }
      case MessageType.GetNotionPages: {
        getNotionPages(message.spaceId, message.recentIds, message.notionUserId).then((res) => {
          sendResponse(res);
        });
        break;
      }
      case MessageType.SearchNotionPages: {
        if (!message.query || !message.spaceId) break;
        searchNotionPages(message.query, message.spaceId, message.limit).then((res) => {
          sendResponse(res);
        });
        break;
      }
      case MessageType.GetNotionImage: {
        if (!message.imageOptions) break;
        getImage(message.imageOptions).then((res) => {
          sendResponse(res);
        });
        break;
      }
      case MessageType.GetUserIds: {
        getSpaces().then((res: GetSpacesRes) => {
          sendResponse(res);
        });
        break;
      }
      case MessageType.AddTextToNotion: {
        if (!message.notionPageId || !message.notionTextChunks) break;
        addTextToNotion(message.notionPageId, message.notionTextChunks).then((res) => {
          sendResponse(res);
        });
        break;
      }
      case MessageType.GetNotionSpaceUsers: {
        if (!message.spaceId) break;
        getSpaceUsers(message.spaceId).then((res) => {
          sendResponse(res);
        });
        break;
      }
      case MessageType.GetNotionDBSchema: {
        if (!message.dbId) break;
        getDBSchema(message.dbId).then((res) => {
          sendResponse(res);
        });
        break;
      }
      case MessageType.AddNotionRow: {
        if (!message.dbId || !message.updates || !message.notionTextChunks) break;
        addEntryToDB(message.dbId, message.updates, message.notionTextChunks).then((res) => {
          sendResponse(res);
        });
        break;
      }
      case SocketMessageType.JoinRoom: {
        if (!message.userId) break;
        // socket.emit(SocketMessageType.JoinRoom, message.userId);
        break;
      }
      case SocketMessageType.LeaveRoom: {
        if (!message.userId) break;
        // socket.emit(SocketMessageType.LeaveRoom, message.userId);
        break;
      }
      case SocketMessageType.NotificationTrayOpened: {
        if (!message.userId) break;
        // socket.emit(SocketMessageType.NotificationTrayOpened, message.userId);
        break;
      }
      case SocketMessageType.ReadNotification: {
        if (!message.notificationId) break;
        // socket.emit(SocketMessageType.ReadNotification, message.notificationId);
        break;
      }
      case MessageType.OpenTab: {
        if (!message.url) break;
        chrome.tabs.create(
          {
            url: message.url,
            active: message.active || false,
          },
          () => sendResponse({ success: true }),
        );
        break;
      }
      case MessageType.GoToPage: {
        if (!message.url) break;
        chrome.tabs.update(
          {
            url: message.url,
          },
          () => sendResponse({ success: true }),
        );
        break;
      }
      case MessageType.Sync: {
        break;
      }
      case MessageType.Test: {
        chrome.tabs.query({}, (tabs: chrome.tabs.Tab[]) => {
          tabs.forEach((tab) => {
            if (!tab.id) return;
            chrome.tabs.sendMessage(tab.id, { type: MessageType.InjectLatestContentScript });
          });
        });
        break;
      }
      case ExternalMessageType.Login: {
        if (!message.token || !message.user) break;
        sendMessageToWebsite(message);
        break;
      }
      case ExternalMessageType.UpdateProfile: {
        if (!message.user) break;
        sendMessageToWebsite(message);
        break;
      }
      case ExternalMessageType.IsAuthenticated ||
        ExternalMessageType.Exists ||
        ExternalMessageType.Logout: {
        sendMessageToWebsite(message);
        break;
      }
    }

    return true;
  },
);

// Messages received from outside the extension (messages from frontend website)
chrome.runtime.onMessageExternal.addListener(
  (
    message: Message,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: any) => void,
  ) => {
    switch (message.type) {
      case ExternalMessageType.Exists: {
        sendResponse({ success: true });
        break;
      }
      case ExternalMessageType.Login: {
        if (!message.user || !message.token) return;
        sendMessageToExtension({ type: SocketMessageType.JoinRoom, userId: message.user.id });
        set({
          token: message.token,
          isExtensionOn: true,
          user: new User(message.user),
        })
          .then(() => set({ isAuthenticated: true }))
          .then(() => analyticsWrapper('Logged In', message.user, {}))
          .then(() => {
            getSpaces().then((res: GetSpacesRes) => {
              if (res.success) {
                res.notionUserIds.forEach((notionUserId) => {
                  // set recents and defaults
                  getNotionPages(null, null, notionUserId).then((res) => {
                    if (res.success) {
                      // set defaults
                      if (res.defaults) {
                        set({ notionDefaults: res.defaults });
                      }
                      // set recents
                      get1('notionRecents').then(
                        (notionRecents: { [spaceId: string]: Record[] } | undefined) => {
                          if (res.spaces && res.spaces.length > 0 && res.results) {
                            const recents = notionRecents || {};
                            res.spaces.forEach((s: Record) => {
                              recents[s.id] = res.results![s.id].recents || [];
                            });
                            set({ notionRecents: recents });
                          }
                        },
                      );
                    }
                  });
                  // set spaceId, spaceUsers and spaceBots
                  getNotionPages().then((res) => {
                    if (res.success && res.spaces) {
                      const space = res.spaces[0];
                      const spaceId = space?.id;
                      const userId = space?.userId;
                      set({ spaceId, notionUserId: userId });
                      analyticsWrapper('Set Workspace', null, {
                        spaceId: space?.id,
                        spaceName: space?.name,
                        spaceEmail: space?.email,
                      });
                      getSpaceUsers(spaceId).then((res) => {
                        if (res.success) {
                          set({
                            spaceUsers: res.users,
                            spaceBots: res.bots,
                          });
                        }
                      });
                    }
                  });
                });
              }
            });
          })
          .then(() => {
            sendResponse(true);
          });
        break;
      }
      case ExternalMessageType.IsAuthenticated: {
        get({
          isAuthenticated: false,
          token: '',
          user: null,
        }).then((res) => sendResponse(res));
        break;
      }
    }
    return true;
  },
);

// change in notification display icon
chrome.storage.onChanged.addListener((change) => {
  if (change.notificationDisplayIcon !== undefined) {
    if (change.notificationDisplayIcon.newValue !== undefined) {
      chrome.browserAction.setBadgeText({
        text:
          change.notificationDisplayIcon.newValue !== 0
            ? change.notificationDisplayIcon.newValue.toString()
            : '',
      });
      chrome.browserAction.setBadgeBackgroundColor({ color: '#FF0000' });
    } else chrome.browserAction.setBadgeText({ text: '' });
  }
});

// Listen on when a tab becomes active
chrome.tabs.onActivated.addListener((activeInfo) => {
  console.log(`Tab ${activeInfo.tabId} active.`);
});

// Extension installed or updated
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Running install scripts');
    sendMessageToWebsite({ type: ExternalMessageType.Exists });
    chrome.tabs.update({ url: `${ORIGIN}/signup` });
    // inject content script in all tabs (if not aleady there)
    chrome.tabs.query({}, (tabs: chrome.tabs.Tab[]) => {
      tabs.forEach((tab) => {
        if (!tab.id) return;
        chrome.tabs.sendMessage(
          tab.id,
          { type: MessageType.InjectLatestContentScript },
          (response) => {
            if (!tab.id || tab.url?.slice(0, 9) === 'chrome://') return;
            if (response === undefined) {
              chrome.tabs.executeScript(tab.id, { file: 'js/content.js' });
            }
          },
        );
      });
    });
  }
});

// When update is available, immediately fetch that update
chrome.runtime.onUpdateAvailable.addListener(function (details) {
  console.log('Updating to version ' + details.version);
  // reloads the extension
  chrome.runtime.reload();
  // update content script in all tabs (if not aleady there)
  chrome.tabs.query({}, (tabs: chrome.tabs.Tab[]) => {
    tabs.forEach((tab) => {
      if (!tab.id) return;
      chrome.tabs.sendMessage(
        tab.id,
        { type: MessageType.InjectLatestContentScript },
        (response) => {
          if (!tab.id) return;
          if (response === undefined) {
            chrome.tabs.executeScript(tab.id, { file: 'js/content.js' });
          }
        },
      );
    });
  });
});
