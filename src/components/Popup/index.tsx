import { Switch, Tabs } from 'antd';
import 'antd/dist/antd.min.css';
import React, { useEffect, useState } from 'react';
import Notification from '../../entities/Notification';
import IUser from '../../models/entities/IUser';
import { get, set } from '../../utils/chrome/storage';
import { getAllTabs } from '../../utils/chrome/tabs';
import { triggerSync } from '../Content/helpers/Syncer';
import Notifications from './Notifications';
import Profile from './Profile';
import './style.scss';

export default function Popup() {
  /**
   * State for all components in Popup.
   */
  const [notifications, setNotifications] = useState<Notification[]>([]);

  /**
   * Global state.
   */
  const [isExtensionOn, setIsExtensionOn] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<IUser | null>(null);

  useEffect(() => {
    get(null).then((items) => {
      if (items.isExtensionOn) setIsExtensionOn(items.isExtensionOn);
      if (items.isAuthenticated) setIsAuthenticated(items.isAuthenticated);
      if (items.user) setUser(items.user);
    });
    
    chrome.storage.onChanged.addListener((changes) => {
      if (changes.isExtensionOn) setIsExtensionOn(changes.isExtensionOn.newValue);
      if (changes.isAuthenticated) setIsAuthenticated(changes.isAuthenticated.newValue);
      if (changes.user) setUser(changes.user.newValue);
    });
  }, []);

  /**
   * Establish socket to server to receive notifications.
   */
  useEffect(() => {
    // const getNotifications = async (): Promise<void> => {
    //   const n = notificationData[0];
    //   let notifs: Notification[] = [];
    //   for (let i = 0; i <= 10; i++) {
    //     let s: any = {};
    //     s = Object.assign(s, n);
    //     s.id = i.toString();
    //     notifs.push(s);
    //   }
    //   setNotifications(notifs);
    // }
    // getNotifications();
  }, []);

  /**
   * Turn extension on/off. Save to global state.
   * @param checked New global on/off value.
   */
  const handleOnOff = async (checked: boolean) => {
    await set({ isExtensionOn: checked })
      .then(async () => { triggerSync(await getAllTabs(), 'isExtensionOn'); });
  }

  return (
    <div className="TbdPopupContainer">
      <Tabs defaultActiveKey="1">
        <Tabs.TabPane tab="notifications" key="1">
          <div className="TbdPopupContainer__TabWrapper">
            {notifications && <Notifications notifications={notifications} />}
          </div>
        </Tabs.TabPane>
        <Tabs.TabPane tab="profile" key="2">
          <div className="TbdPopupContainer__TabWrapper">
            {user && <Profile user={user} />}
          </div>
        </Tabs.TabPane>
      </Tabs>
      <div className="TbdPopupContainer__OnOffWrapper">
        <div className="TbdPopupContainer__OnOffTextWrapper">
          <div>Turn Accord</div>
          <div className="TbdPopupContainer__OnOff">{isExtensionOn ? 'OFF' : 'ON'}</div>
        </div>
        <Switch onClick={(checked) => { handleOnOff(checked); }} checked={isExtensionOn} />
      </div>
    </div>
  );
};
