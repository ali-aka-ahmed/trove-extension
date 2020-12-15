import React from 'react';
import ReactDOM from 'react-dom';
import TooltipWrapper from '../components/TooltipWrapper';
import { get } from '../utils/chrome/storage';

// Render tooltip
let isAuthenticated: boolean = false;
let isExtensionOn: boolean = false;
get(['isAuthenticated', 'isExtensionOn'])
  .then((data) => {
    isAuthenticated = data.isAuthenticated || false;
    isExtensionOn = data.isExtensionOn || false;
    if (isAuthenticated && isExtensionOn) {
      renderTooltip();
    }
  });

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
      renderTooltip();
    } else {
      removeTooltip();
    }
  }
});

const renderTooltip = () => {
  const tooltipContainer = document.createElement('div');
  tooltipContainer.setAttribute('id', 'TroveTooltipWrapper');
  document.body.appendChild(tooltipContainer);

  const tooltipShadowRoot = tooltipContainer.attachShadow({ mode: 'open' });
  ReactDOM.render(<TooltipWrapper root={tooltipShadowRoot} />, tooltipShadowRoot);
}

const removeTooltip = () => {
  const tooltipContainer = document.getElementById('TroveTooltipWrapper');
  if (tooltipContainer) {
    tooltipContainer.remove();
  }
}
