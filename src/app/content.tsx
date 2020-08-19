import React from 'react';
import ReactDOM from 'react-dom';
import Extension from '../components/content';

const container = document.createElement('div');
container.setAttribute('class', 'TbdExtension');
document.body.appendChild(container);

// Shadow DOM
const shadowRoot = container.attachShadow({ mode: 'open' });
ReactDOM.render(<Extension />, shadowRoot);
