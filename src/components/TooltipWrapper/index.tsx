import antdStyles from 'antd/dist/antd.min.css?inject';
import React, { useEffect } from 'react';
import { ErrorOrigin } from '../../app/server/misc';
import contentStyles from '../content/index.scss?inject';
import ErrorBoundary from '../errorBoundary/index';
import './index.scss';
import Tooltip from './Tooltip';
import dropdownStyles from './Tooltip/Dropdown/index.scss?inject';
import editorStyles from './Tooltip/Editor/index.scss?inject';
import { isOsKeyPressed } from './Tooltip/helpers/os';
import hintStyles from './Tooltip/hint.scss?inject';
import tooltipStyles from './Tooltip/index.scss?inject';

interface TooltipWrapperProps {
  root: ShadowRoot;
}

export default function TooltipWrapper(props: TooltipWrapperProps) {

  // Special case where we want to disable native bookmarks shortcut even if user isn't
  // logged in or extension is off
  const onKeyDownPage = (e: KeyboardEvent) => {
    if (isOsKeyPressed(e) && e.key === 'd') {
      e.preventDefault();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', onKeyDownPage);
    return () => document.removeEventListener('keydown', onKeyDownPage);
  }, [onKeyDownPage]);

  const url = new URL(window.location.href);
  // if (EXCLUDED_HOSTNAMES.includes(url.hostname)) {
  //   return <div />;
  // } else {
    return (
      <>
        <ErrorBoundary origin={ErrorOrigin.ContentScript}>
          <Tooltip root={props.root} />
        </ErrorBoundary>
        <style type="text/css">{antdStyles}</style>
        <style type="text/css">{editorStyles}</style>
        <style type="text/css">{dropdownStyles}</style>
        <style type="text/css">{hintStyles}</style>
        <style type="text/css">{tooltipStyles}</style>
        <style type="text/css">{contentStyles}</style>
      </>
    );
  }
// }
