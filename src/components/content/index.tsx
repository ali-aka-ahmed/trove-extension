import antdStyles from 'antd/dist/antd.min.css?inject';
import React from 'react';
import tabStyles from '../../styles/tabs.scss?inject';
import ErrorBoundary from './ErrorBoundary';
import './index.scss';
import Sidebar from './Sidebar';
import bubbleStyles from './sidebar/bubble/index.scss?inject';
import sidebarStyles from './sidebar/index.scss?inject';

export default function Content() {
  return (
    <ErrorBoundary>
      <Sidebar />
      <style type="text/css">{antdStyles}</style>
      <style type="text/css">{sidebarStyles}</style>
      <style type="text/css">{bubbleStyles}</style>
      <style type="text/css">{tabStyles}</style>
    </ErrorBoundary>
  );
}
