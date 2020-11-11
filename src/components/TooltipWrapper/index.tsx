import React from 'react';
import quillStyles from 'react-quill/dist/quill.bubble.css?inject';
import ErrorBoundary from '../ErrorBoundary';
import './index.scss';
import Tooltip from './Tooltip';
import editorStyles from './Tooltip/editor.scss?inject';
import tooltipStyles from './Tooltip/index.scss?inject';
import inputPillStyles from './Tooltip/InputPill/index.scss?inject';
import pillStyles from './Tooltip/Pill/index.scss?inject';

export default function TooltipWrapper() {
  return (
    <ErrorBoundary>
      <Tooltip />
      <style type="text/css">{quillStyles}</style>
      <style type="text/css">{editorStyles}</style>
      <style type="text/css">{tooltipStyles}</style>
      <style type="text/css">{pillStyles}</style>
      <style type="text/css">{inputPillStyles}</style>
    </ErrorBoundary>
  );
}
