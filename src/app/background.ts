import { createPost, createReply, getPosts } from '../server/posts';
import { handleUsernameSearch } from '../server/users';
import { get, get1, remove, set } from '../utils/chrome/storage';
import { Message } from '../utils/chrome/tabs';

get(null).then(items => {
  // Object.keys(items).forEach(key => remove(key)); 
  console.log(items);
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
    case 'createReply': {
      if (!message.id || !message.post) break;
      const res = await createReply(message.id, message.post);
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
