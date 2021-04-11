import React from 'react';
import ReactDOM from 'react-dom';
import TooltipWrapper from '../components/TooltipWrapper';
import { Message, MessageType } from '../utils/chrome/tabs';

const renderTooltip = () => {
  const tooltipContainer = document.createElement('div');
  tooltipContainer.setAttribute('id', 'TroveTooltipWrapper');
  document.body.appendChild(tooltipContainer);

  const tooltipShadowRoot = tooltipContainer.attachShadow({ mode: 'open' });
  ReactDOM.render(<TooltipWrapper root={tooltipShadowRoot} />, tooltipShadowRoot);
  return true;
};

const removeTooltip = () => {
  const tooltipContainer = document.getElementById('TroveTooltipWrapper');
  if (tooltipContainer) tooltipContainer.remove();
  return true;
};

// Render tooltip
renderTooltip();
console.info('Trove in tab!');

// Listener to re-inject latest tooltip
chrome.runtime.onMessage.addListener(
  (
    message: Message,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: any) => void,
  ) => {
    switch (message.type) {
      case MessageType.InjectLatestContentScript: {
        new Promise(() => {
          removeTooltip();
        })
          .then(() => {
            renderTooltip();
          })
          .then(() => {
            sendResponse('Re-injected!');
          });
        break;
      }
    }
  },
);
