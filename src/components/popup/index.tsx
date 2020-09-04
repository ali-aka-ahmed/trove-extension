import { Tabs } from 'antd';
import 'antd/dist/antd.min.css';
import React, { useEffect } from 'react';
import './index.scss';
import Notifications from './notifications';
import Profile from './profile';
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
          <Notifications />
        </Tabs.TabPane>
        <Tabs.TabPane tab="profile" key="2">
          <Profile />
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
}
