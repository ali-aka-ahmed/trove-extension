import { localSet } from '../utils/chromeStorage';
import { users } from '../utils/data';

// Listen to messages sent from other parts of the extension.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // onMessage must return 'true' if response is async.
  let isResponseAsync = false;
  if (request.popupMounted) console.log('eventPage notified that Popup.tsx has mounted.');
  return isResponseAsync;
});

chrome.runtime.onStartup.addListener(async () => {
  console.log('onStartup');

  // Check if user token exists

  // If it does, then log the user in and fetch their details (auth = true)
  const userDetails = users.find(user => user.id === 'fce65bd0-8af5-4504-a19d-8cbc767693f7')!;
  await localSet({ user: userDetails, authenticated: true });

  // If not, then show signup page (auth = false)
})

// Extension installed or updated
chrome.runtime.onInstalled.addListener(async () => {
  console.log('onInstalled');

  // Check if user token exists

  // If it does, then log the user in and fetch their details (auth = true)
  const userDetails = users.find(user => user.id === 'fce65bd0-8af5-4504-a19d-8cbc767693f7')!;
  await localSet({ user: userDetails, authenticated: true });

  // If not, then show signup page (auth = false)
})
