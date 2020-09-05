import React from 'react';
import ErrorBoundary from './ErrorBoundary';
import './index.scss';
import Sidebar from './sidebar';
import bubbleStyles from './sidebar/bubble/index.scss?inject';
import sidebarStyles from './sidebar/index.scss?inject';

export default function Content() {
  return (
    <ErrorBoundary>
      <Sidebar />
      <style type="text/css">{sidebarStyles}</style>
      <style type="text/css">{bubbleStyles}</style>
    </ErrorBoundary>
  );
}
