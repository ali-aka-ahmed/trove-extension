import { rLogin } from '../server';
import userStore from '../state/stores/UserStore';

// Listen to messages sent from other parts of the extension.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // onMessage must return 'true' if response is async.
  let isResponseAsync = false;

  if (request.popupMounted) {
    console.log('eventPage notified that Popup.tsx has mounted.');
  }

  return isResponseAsync;
});

chrome.runtime.onStartup.addListener(async () => {
  console.log('onStartup')
  // Check if user token exists
  // If it does, then log the user in and fetch their details (auth = true)
  const user = await rLogin()
  userStore.update(user)
  // If not, then show signup page (auth = false)
})

// Extension installed or updated
chrome.runtime.onInstalled.addListener(() => {
  console.log('onInstalled')
  // Check if user token exists
  // If it does, then log the user in and fetch their details (auth = true)
  const user = rLogin()
  console.log('user', user)
  userStore.update(user)
  console.log('userStore', userStore)
  // If not, then show signup page (auth = false)
})
