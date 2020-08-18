import React from 'react';
import Sidebar from '../components/sidebar';
import bubbleStyles from '../components/sidebar/bubble/index.scss';
import sidebarStyles from '../components/sidebar/index.scss';
import ErrorBoundary from './ErrorBoundary';
import fonts from './fonts.scss';

export default function Extension() {
  return (
    <ErrorBoundary>
      <Sidebar />
      <style type="text/css">{fonts}</style>
      <style type="text/css">{sidebarStyles}</style>
      <style type="text/css">{bubbleStyles}</style>
    </ErrorBoundary>
  );
}
