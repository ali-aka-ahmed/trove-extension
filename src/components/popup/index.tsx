import { Tabs } from 'antd';
import 'antd/dist/antd.min.css';
import React, { useEffect } from 'react';
import './index.scss';
import './tabs.scss';

export default function Popup() {
  useEffect(() => {
    // Example of how to send a message to eventPage.ts.
    chrome.runtime.sendMessage({ popupMounted: true });
  }, []);

  return (
    <div className='TbdPopupContainer'>
      <Tabs defaultActiveKey="1">
        <Tabs.TabPane tab="notifications" key="1">
          hello world!
        </Tabs.TabPane>
        <Tabs.TabPane tab="PROFILE" key="2">
          hello world!
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
}
