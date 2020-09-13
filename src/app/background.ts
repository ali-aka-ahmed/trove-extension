import { triggerSync } from "../components/content/sidebar/Syncer";
import { getActiveTabs, Message } from "../utils/chrome/tabs";

// Listen to messages sent from other parts of the extension
chrome.runtime.onMessage.addListener(async (message: Message, sender, sendResponse) => {
  if (message.type.slice(0, 5) === 'sync.') {
    triggerSync(await getActiveTabs(), message);
  }
});

// Listen on when a tab becomes active
chrome.tabs.onActivated.addListener((activeInfo) => {
  console.log(`Tab ${activeInfo.tabId} active.`);
  triggerSync(activeInfo.tabId, ['isOpen', 'position']);
});
