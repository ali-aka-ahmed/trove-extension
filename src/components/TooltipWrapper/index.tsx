import React from 'react';
import ErrorBoundary from '../ErrorBoundary';
import './index.scss';
import Tooltip from './Tooltip';
import tooltipStyles from './Tooltip/index.scss?inject';
import inputPillStyles from './Tooltip/InputPill/index.scss?inject';
import pillStyles from './Tooltip/Pill/index.scss?inject';

export default function TooltipWrapper() {
  return (
    <ErrorBoundary>
      <Tooltip />
      <style type="text/css">{tooltipStyles}</style>
      <style type="text/css">{pillStyles}</style>
      <style type="text/css">{inputPillStyles}</style>
    </ErrorBoundary>
  );
}
