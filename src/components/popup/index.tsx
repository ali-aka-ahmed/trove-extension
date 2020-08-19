import React, { useEffect } from 'react';
import './index.scss';

export default function Popup() {
  useEffect(() => {
    // Example of how to send a message to eventPage.ts.
    chrome.runtime.sendMessage({ popupMounted: true });
  }, []);

  return <div className='TbdPopupContainer'>Hello, world!!!</div>;
}
