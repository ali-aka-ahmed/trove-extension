import { Tabs } from 'antd';
import 'antd/dist/antd.min.css';
import React, { useEffect, useState } from 'react';
import 'react-quill/dist/quill.bubble.css';
import { socket } from '../../app/background';
import Notification from '../../entities/Notification';
import User from '../../entities/User';
import INotification from '../../models/INotification';
import { ErrorOrigin } from '../../server/misc';
import { get, set } from '../../utils/chrome/storage';
import ErrorBoundary from '../ErrorBoundary';
import BottomBar from './BottomBar';
import Login from './Login';
import Notifications from './Notifications';
import Profile from './Profile';
import './style.scss';

export default function Popup() {
  const [tabKey, setTabKey] = useState("1");
  
  /**
   * Global state.
   */
  const [isExtensionOn, setIsExtensionOn] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    get({
      isAuthenticated: false,
      isExtensionOn: false,
      user: null,
      notifications: [],
    }).then((items) => {
      setIsAuthenticated(items.isAuthenticated);
      if (items.isAuthenticated) {
        setNotifications(items.notifications.map((n: INotification) => new Notification(n)));
        setIsExtensionOn(items.isExtensionOn);
        setUser(new User(items.user));
      }
    });

    chrome.storage.onChanged.addListener((change) => {
      if (change.isExtensionOn !== undefined) {
        if (change.isExtensionOn.newValue !== undefined) setIsExtensionOn(change.isExtensionOn.newValue);
        else setIsExtensionOn(false);
      }
      if (change.isAuthenticated !== undefined) {
        if (change.isAuthenticated.newValue !== undefined) setIsAuthenticated(change.isAuthenticated.newValue);
        else setIsAuthenticated(false);
      }
      if (change.user !== undefined) {
        if (change.user.newValue !== undefined) setUser(new User(change.user.newValue));
        else setUser(null)
      }
      if (change.notifications !== undefined) {
        if (change.notifications.newValue !== undefined) setNotifications(change.notifications.newValue.map((n: INotification) => new Notification(n)));
        else setNotifications([])
      }
    });
  }, []);

  useEffect(() => {
    const zeroNotificationDisplayIcon = async () => {
      if (tabKey === "1" && user) {
        await set({ notificationDisplayIcon: 0 })
        socket.emit('opened notification tray', user.id)
      }
    };
    zeroNotificationDisplayIcon();
  }, [tabKey, user])


  return (
    <ErrorBoundary origin={ErrorOrigin.Popup}>
      <div className="TbdPopupContainer">
        {isAuthenticated ? (
          <>
            <Tabs activeKey={tabKey} onChange={(newTabKey) => setTabKey(newTabKey)}>
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
            <BottomBar isExtensionOn={isExtensionOn} />
          </>
        ) : (
          <Login />
        )}
      </div>
    </ErrorBoundary>
  );
};
