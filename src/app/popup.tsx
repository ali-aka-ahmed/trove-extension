import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Popup from '../components/Popup';

chrome.tabs.query({ active: true, currentWindow: true }, (tab) => {
  ReactDOM.render(<Popup />, document.getElementById('popup'));
});

// chrome.runtime.onMessage.addListener((
//   message: Message, 
//   sender: chrome.runtime.MessageSender, 
//   sendResponse: (response: any) => void
// ) => {
//   if (message.type === MessageType.GetTabId) {
//     sendResponse(sender.tab?.id);
//   }

//   return true;
// });
