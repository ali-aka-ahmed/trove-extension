import React from 'react';
import ReactDOM from 'react-dom';
import SidebarWrapper from '../components/SidebarWrapper';
import TooltipWrapper from '../components/TooltipWrapper';

// Render sidebar
const sidebarContainer = document.createElement('div');
sidebarContainer.setAttribute('class', 'TbdSidebarWrapper');
document.body.appendChild(sidebarContainer);

const sidebarShadowRoot = sidebarContainer.attachShadow({ mode: 'open' });
ReactDOM.render(<SidebarWrapper />, sidebarShadowRoot);

// Render tooltip
// TODO: convert shadow host to React component so we can remove entire tooltip
// when it's no longer visible
const tooltipContainer = document.createElement('div');
tooltipContainer.setAttribute('class', 'TbdTooltipWrapper');
document.body.appendChild(tooltipContainer);

const tooltipShadowRoot = tooltipContainer.attachShadow({ mode: 'open' });
ReactDOM.render(<TooltipWrapper />, tooltipShadowRoot);
