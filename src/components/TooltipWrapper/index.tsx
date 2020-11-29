import antdStyles from 'antd/dist/antd.min.css?inject';
import React from 'react';
import quillStyles from 'react-quill/dist/quill.bubble.css?inject';
import { ErrorOrigin } from '../../server/misc';
import ErrorBoundary from '../errorBoundary/index';
import './index.scss';
import Tooltip from './Tooltip';
import editorStyles from './Tooltip/editor.scss?inject';
import tooltipStyles from './Tooltip/index.scss?inject';
import inputPillStyles from './Tooltip/InputPill/index.scss?inject';
import pillStyles from './Tooltip/Pill/index.scss?inject';

interface TooltipWrapperProps {
  root: ShadowRoot;
}

export default function TooltipWrapper(props: TooltipWrapperProps) {
  return (
    <>
      <ErrorBoundary origin={ErrorOrigin.ContentScript}>
        <Tooltip root={props.root} />
      </ErrorBoundary>
      <style type="text/css">{antdStyles}</style>
      <style type="text/css">{quillStyles}</style>
      <style type="text/css">{editorStyles}</style>
      <style type="text/css">{tooltipStyles}</style>
      <style type="text/css">{pillStyles}</style>
      <style type="text/css">{inputPillStyles}</style>
    </>
  );
}
