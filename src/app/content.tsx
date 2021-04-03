import React from 'react';
import ReactDOM from 'react-dom';
import TooltipWrapper from '../components/TooltipWrapper';
import { get } from '../utils/chrome/storage';
import { Message, MessageType } from '../utils/chrome/tabs';

// Render tooltip
let isAuthenticated: boolean = false;
let isExtensionOn: boolean = false;
console.info('Trove in tab!');
get(['isAuthenticated', 'isExtensionOn']).then((data) => {
  isAuthenticated = data.isAuthenticated || false;
  isExtensionOn = data.isExtensionOn || false;
  if (isAuthenticated && isExtensionOn) renderTooltip();
});

// content script listeners
chrome.storage.onChanged.addListener((change) => {
  let isChanged = false;
  if (change.isAuthenticated !== undefined) {
    isChanged = true;
    isAuthenticated = change.isAuthenticated.newValue || false;
  }

  if (change.isExtensionOn !== undefined) {
    isChanged = true;
    isExtensionOn = change.isExtensionOn.newValue || false;
  }

  if (isChanged) {
    if (isAuthenticated && isExtensionOn) {
      console.info('Rendering tooltip');
      renderTooltip();
    } else {
      console.info('Removing tooltip');
      removeTooltip();
    }
  }
});

chrome.runtime.onMessage.addListener(
  (
    message: Message,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: any) => void,
  ) => {
    switch (message.type) {
      case MessageType.InjectLatestContentScript: {
        removeTooltip();
        get(['isAuthenticated', 'isExtensionOn']).then((data) => {
          isAuthenticated = data.isAuthenticated || false;
          isExtensionOn = data.isExtensionOn || false;
          if (isAuthenticated && isExtensionOn) renderTooltip();
        });
        sendResponse('Re-injected!');
        break;
      }
    }
  },
);

const renderTooltip = () => {
  const tooltipContainer = document.createElement('div');
  tooltipContainer.setAttribute('id', 'TroveTooltipWrapper');
  document.body.appendChild(tooltipContainer);

  const tooltipShadowRoot = tooltipContainer.attachShadow({ mode: 'open' });
  ReactDOM.render(<TooltipWrapper root={tooltipShadowRoot} />, tooltipShadowRoot);
};

const removeTooltip = () => {
  const tooltipContainer = document.getElementById('TroveTooltipWrapper');
  if (tooltipContainer) tooltipContainer.remove();
};
