import { createPost } from "../server/posts";
import { handleUsernameSearch } from "../server/users";
import { Message } from "../utils/chrome/tabs";

// Listen to messages sent from other parts of the extension
chrome.runtime.onMessage.addListener(async (
  message: Message, 
  sender: chrome.runtime.MessageSender, 
  sendResponse: (response: any) => void
) => {
  switch (message.type) {
    case 'createPost': {
      if (!message.post) break;
      const post = await createPost(message.post);
      sendResponse(!!post);
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
});

// Extension installed or updated
chrome.runtime.onInstalled.addListener(async () => {
});
