import React from 'react';
import ReactDOM from 'react-dom';
import Extension from './Extension';
import './index.scss';

const container = document.createElement('div');
container.setAttribute('class', 'TbdExtension');
document.body.appendChild(container);

// Shadow DOM
const shadowRoot = container.attachShadow({ mode: 'open' });
const root = shadowRoot.appendChild(document.createElement('div'));
root.setAttribute('class', 'TbdRoot');

Object.defineProperty(root, 'ownerDocument', { value: shadowRoot });
//@ts-ignore
shadowRoot.createElement = (...args) => document.createElement(...args);
//@ts-ignore
shadowRoot.createElementNS = (...args) => document.createElementNS(...args);
//@ts-ignore
shadowRoot.createTextNode = (...args) => document.createTextNode(...args);

ReactDOM.render(<Extension />, root);
