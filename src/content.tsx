import React from 'react';
import ReactDOM from 'react-dom';
import Sidebar from './components/Sidebar';

const ext = document.createElement('div');
ext.setAttribute('id', 'tbd-ext');
document.body.appendChild(ext);

ReactDOM.render(<Sidebar />, ext);
