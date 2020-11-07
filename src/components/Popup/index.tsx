import { LoadingOutlined } from '@ant-design/icons';
import { Switch, Tabs } from 'antd';
import 'antd/dist/antd.min.css';
import React, { useEffect, useState } from 'react';
import { socket } from '../../app/background';
import Notification from '../../entities/Notification';
import User from '../../entities/User';
import INotification from '../../models/INotification';
import { MessageType, sendMessageToWebsite } from '../../utils/chrome/external';
import { get, remove, set } from '../../utils/chrome/storage';
import Login from './Login';
import Profile from './Profile';
import './style.scss';

export default function Popup() {
  const [logoutLoading, setLogoutLoading] = useState(false);
  
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
      console.log('items', items);
      if (items.isAuthenticated) {
        setNotifications(items.notifications.map((n: INotification) => new Notification(n)));
        setIsExtensionOn(items.isExtensionOn);
        setUser(new User(items.user));
      }
    });

    chrome.storage.onChanged.addListener((change) => {
      if (change.isExtensionOn !== undefined) {
        if (change.isExtensionOn.newValue) setIsExtensionOn(change.isExtensionOn.newValue);
        else setIsExtensionOn(false);
      }
      if (change.isAuthenticated !== undefined) {
        if (change.isAuthenticated.newValue) setIsAuthenticated(change.isAuthenticated.newValue);
        else setIsAuthenticated(false);
      }
      if (change.user !== undefined) {
        if (change.user.newValue) setUser(new User(change.user.newValue));
        else setUser(null)
      }
      if (change.notifications !== undefined) {
        if (change.notifications.newValue) setNotifications(change.notifications.newValue.map((n: INotification) => new Notification(n)));
        else setNotifications([])
      }
    });
  }, []);

  const handleLogout = async () => {
    setLogoutLoading(true)
    const items = await get(null)
    socket.emit('leave room', items.user.id);
    await remove(Object.keys(items))
    await set({ isAuthenticated: false })
    sendMessageToWebsite({ type: MessageType.Logout })
    setLogoutLoading(false)
  }

  /**
   * Turn extension on/off. Save to global state.
   * @param checked New global on/off value.
   */
  const handleOnOff = async (checked: boolean) => {
    if (!isAuthenticated) return;
    await set({ isExtensionOn: checked });
  }
  
  return (
    <div className="TbdPopupContainer">
      {isAuthenticated ? (
        <Tabs defaultActiveKey="2">
          {/* <Tabs.TabPane tab="notifications" key="1" CHANGE DEFAULT ACTIVE KEY BACK TO 1>
            <div className="TbdPopupContainer__TabWrapper">
              {notifications && <Notifications notifications={notifications} />}
            </div>
          </Tabs.TabPane> */}
          <Tabs.TabPane tab="profile" key="2">
            <div className="TbdPopupContainer__TabWrapper">
              {user && <Profile user={user} />}
            </div>
          </Tabs.TabPane>
        </Tabs>
      ) : (
        <Login />
      )}
      <div className="TbdPopupContainer__BottomWrapper">
        <div className="TbdPopupContainer__OnOffWrapper">
          <div className="TbdPopupContainer__OnOffTextWrapper">
            <div>Turn Trove</div>
            <div className="TbdPopupContainer__OnOff">{isExtensionOn ? 'OFF' : 'ON'}</div>
          </div>
          <Switch onClick={(checked) => { handleOnOff(checked); }} checked={isExtensionOn} />
        </div>
        {isAuthenticated ? (
          <div className='TbdPopupContainer__ButtonWrapper'>
            {!logoutLoading ? (
              <button
                className='TbdPopupContainer__Button'
                onClick={handleLogout}
              >
                Logout
              </button>
            ) : (
              <div className='TbdPopupContainer__Loading'><LoadingOutlined /></div>
            )}
          </div>
        ) : (
          <div></div>
        )}
      </div>
    </div>
  );
};
