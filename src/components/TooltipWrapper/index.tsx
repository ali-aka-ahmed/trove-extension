import antdStyles from 'antd/dist/antd.min.css?inject';
import React from 'react';
import { ErrorOrigin } from '../../app/server/misc';
import { EXCLUDED_HOSTNAMES } from '../../constants';
import ErrorBoundary from '../errorBoundary/index';
import './index.scss';
import Tooltip from './Tooltip';
import dropdownStyles from './Tooltip/Dropdown/index.scss?inject';
import quillStyles from './Tooltip/Editor/index.scss?inject';
import tooltipStyles from './Tooltip/index.scss?inject';
import inputPillStyles from './Tooltip/InputPill/index.scss?inject';
import pillStyles from './Tooltip/Pill/index.scss?inject';
import editorStyles from './Tooltip/TextareaEditor/index.scss?inject';

interface TooltipWrapperProps {
  root: ShadowRoot;
}

export default function TooltipWrapper(props: TooltipWrapperProps) {
  const url = new URL(window.location.href);
  if (EXCLUDED_HOSTNAMES.includes(url.hostname)) return <div />;
  else
    return (
      <>
        <ErrorBoundary origin={ErrorOrigin.ContentScript}>
          <Tooltip root={props.root} />
        </ErrorBoundary>
        <style type="text/css">{antdStyles}</style>
        <style type="text/css">{quillStyles}</style>
        <style type="text/css">{editorStyles}</style>
        <style type="text/css">{dropdownStyles}</style>
        <style type="text/css">{tooltipStyles}</style>
        <style type="text/css">{pillStyles}</style>
        <style type="text/css">{inputPillStyles}</style>
      </>
    );
}
