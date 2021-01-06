import User from '../entities/User';
import { Message as EMessage, MessageType as EMessageType } from '../utils/chrome/external';
import { get, get1, remove, set } from '../utils/chrome/storage';
import { Message, MessageType } from '../utils/chrome/tabs';
import { forgotPassword, login } from './server/auth';
import { createPost, createReply, getPosts, likePost, unlikePost } from './server/posts';
import { getTopics } from './server/topics';
import { handleUserSearch, updateUser } from './server/users';
import { socket } from './socket';

// get(null).then(items => console.log(items));

// Messages sent from extension (server requests)
chrome.runtime.onMessage.addListener((
  message: Message, 
  sender: chrome.runtime.MessageSender, 
  sendResponse: (response: any) => void,
) => {
  switch (message.type) {
    case MessageType.Login: {
      if (!message.loginArgs) break;
      login(message.loginArgs).then((res) => {
        sendResponse(res);
      })
      break;
    }
    case MessageType.ForgotPassword: {
      if (!message.forgotPasswordArgs) break;
      forgotPassword(message.forgotPasswordArgs).then((res) => {
        sendResponse(res);
      })
      break;
    }
    case MessageType.UpdateUser: {
      if (!message.updateUserArgs) break;
      updateUser(message.updateUserArgs).then((res) => {
        sendResponse(res);
      })
      break;
    }
    case MessageType.CreatePost: {
      if (!message.post) break;
      createPost(message.post).then((res) => {
        sendResponse(res);
      })
      break;
    }
    case MessageType.CreateReply: {
      if (!message.id || !message.post) break;
      createReply(message.id, message.post).then((res) => {
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
      if (!message.text) return;
      handleUserSearch(message.text).then((res) => {
        sendResponse(res);
      });
      break;
    }
    case MessageType.HandleTopicSearch || MessageType.GetTopics: {
      getTopics(!message.text
        ? {}
        : { text: message.text }
      ).then((res) => {
        sendResponse(res);
      })
      break;
    }
    case MessageType.Sync:
      break;
  }

  return true;
});

// Messages received from outside the extension (messages from frontend website)
chrome.runtime.onMessageExternal.addListener((
  message: EMessage,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: any) => void,
) => {
  switch (message.type) {
    case EMessageType.Exists: {
      sendResponse(true);
      break;
    }
    case EMessageType.Login: {
      socket.emit('join room', message.user!.id);
      set({
        user: new User(message.user!),
        token: message.token,
        isExtensionOn: true,
      }).then(() => set({ isAuthenticated: true })).then(() => sendResponse(true))
      break;
    }
    case EMessageType.isAuthenticated: {
      get({
        isAuthenticated: false,
        token: '',
        user: null,
      }).then((res) => sendResponse(res))
      break;
    }
  }
  return true;
});

// Listen on when a tab becomes active
chrome.tabs.onActivated.addListener((activeInfo) => {
  console.log(`Tab ${activeInfo.tabId} active.`);
});

chrome.runtime.onStartup.addListener(() => {
  get1('isAuthenticated').then((isAuthenticated) => {
    if (!isAuthenticated) {
      Promise.all([
        set({ isExtensionOn: false }),
        remove(['token', 'user'])
      ]);
    } else {
      get1('user').then((user) => {
        if (user?.id) socket.emit('join room', user.id);
      })
    }
  });
});

// On tab create
chrome.tabs.onCreated.addListener((tab: chrome.tabs.Tab) => {
  // if (tab.id === undefined) return;
  // const tabId = tab.id.toString();
  // await set({
  //   [key(tabId, 'isOpen')]: false,
  //   [key(tabId, 'position')]: Point.toJSON(DEFAULT_POSITION)
  // });
});

// Extension installed or updated
chrome.runtime.onInstalled.addListener(() => {
  get1('isAuthenticated').then((isAuthenticated) => {
    if (!isAuthenticated) {
      Promise.all([
        set({ isExtensionOn: false }),
        remove(['token', 'user'])
      ]);
    } else {
      get1('user').then((user) => {
        if (user?.id) socket.emit('join room', user.id);
      })
    }
  });
});
