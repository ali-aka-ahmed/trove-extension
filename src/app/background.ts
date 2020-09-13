import { triggerSync } from "../components/Content/Sidebar/Syncer";
import { set } from '../utils/chrome/storage';
import { getActiveTabs, Message } from "../utils/chrome/tabs";
import { users } from '../utils/data';

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

chrome.runtime.onStartup.addListener(async () => {
  console.log('onStartup');

  // Check if user token exists

  // If it does, then log the user in and fetch their details (auth = true)
  const userDetails = users.find(user => user.id === 'fce65bd0-8af5-4504-a19d-8cbc767693f7')!;
  await set({ user: userDetails, isAuthenticated: true });

  // If not, then show signup page (auth = false)
})

// Extension installed or updated
chrome.runtime.onInstalled.addListener(async () => {
  console.log('onInstalled');

  // Check if user token exists

  // If it does, then log the user in and fetch their details (auth = true)
  const userDetails = users.find(user => user.id === 'fce65bd0-8af5-4504-a19d-8cbc767693f7')!;
  await set({ user: userDetails, isAuthenticated: true });

  // If not, then show signup page (auth = false)
})
