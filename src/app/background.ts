import io from 'socket.io-client';
import { BACKEND_URL } from '../config';
import User from '../entities/User';
import { createPost, getPosts } from '../server/posts';
import { handleUsernameSearch } from '../server/users';
import { Message as EMessage, MessageType as EMessageType } from '../utils/chrome/external';
import { get, get1, remove, set } from '../utils/chrome/storage';
import { Message } from '../utils/chrome/tabs';

get(null).then(items => console.log(items));

export const socket = io.connect(BACKEND_URL);

socket.on('notifications', async (notifications: Notification[]) => {
  await set({ notifications })
});

socket.on('notification', async (n: Notification) => {
  const notifications = await get1('notifications')
  const newNotifications = [n].concat(notifications)
  await set({ notifications: newNotifications })
});

// Listen to messages sent from other parts of the extension
chrome.runtime.onMessage.addListener(async (
  message: Message, 
  sender: chrome.runtime.MessageSender, 
  sendResponse: (response: any) => void
) => {
  switch (message.type) {
  case 'createPost': {
    if (!message.post) break;
    const res = await createPost(message.post);
    sendResponse(res);
    break;
  }
  case 'getPosts': {
    if (!message.url) break;
    const res = await getPosts(message.url);
    sendResponse(res);
    break;
  }
  case 'getTabId':
    sendResponse(sender.tab?.id);
    break;
  case 'handleUsernameSearch': {
    if (!message.name) return;
    const res = await handleUsernameSearch(message.name);
    sendResponse(res.users);
    break;
  }
  case 'sync':
    break;
  }

  return true;
});

// Listen on when a tab becomes active
chrome.tabs.onActivated.addListener((activeInfo) => {
  console.log(`Tab ${activeInfo.tabId} active.`);
});

chrome.runtime.onStartup.addListener(async () => {
  const isAuthenticated = await get1('isAuthenticated');
  if (!isAuthenticated) {
  await Promise.all([
    set({ isExtensionOn: false }),
    remove(['token', 'user'])
  ]);
  } else {
  const user = await get1('user')
  socket.emit('join room', user.id);
  }
});

// Extension installed or updated
chrome.runtime.onInstalled.addListener(async () => {
  const isAuthenticated = await get1('isAuthenticated');
  if (!isAuthenticated) {
  await Promise.all([
    set({ isExtensionOn: false }),
    remove(['token', 'user'])
  ]);
  } else {
  const user = await get1('user')
  socket.emit('join room', user.id);
  }
});

// On tab create
chrome.tabs.onCreated.addListener(async (tab: chrome.tabs.Tab) => {
  if (tab.id === undefined) return;
  const tabId = tab.id.toString();
  // await set({
  //   [key(tabId, 'isOpen')]: false,
  //   [key(tabId, 'position')]: Point.toJSON(DEFAULT_POSITION)
  // });
});

// When external message received (from website)
chrome.runtime.onMessageExternal.addListener(async (
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
      await set({
        user: new User(message.user!),
        token: message.token,
        isExtensionOn: true,
      });
      await set({ isAuthenticated: true })
      sendResponse(true);
      break;
    }
  }
  return true;
});