import antdStyles from 'antd/dist/antd.min.css?inject';
import React from 'react';
import ErrorBoundary from '../ErrorBoundary';
import './index.scss';
import Tooltip from './Tooltip';
import tooltipStyles from './Tooltip/index.scss?inject';

export default function TooltipWrapper() {
  return (
    <ErrorBoundary>
      <Tooltip />
      <style type="text/css">{antdStyles}</style>
      <style type="text/css">{tooltipStyles}</style>
    </ErrorBoundary>
  );
}
