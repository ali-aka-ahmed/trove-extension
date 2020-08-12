import React from 'react';
import ReactDOM from 'react-dom';
import Sidebar from './components/sidebar';
import './index.scss';

const ext = document.createElement('div');
ext.setAttribute('class', 'TbdRoot');
document.body.appendChild(ext);

ReactDOM.render(<Sidebar />, ext);
