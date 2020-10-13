import { LoadingOutlined } from '@ant-design/icons';
import { Switch, Tabs } from 'antd';
import 'antd/dist/antd.min.css';
import React, { useEffect, useState } from 'react';
import Notification from '../../entities/Notification';
import User from '../../entities/User';
import { get, remove, set } from '../../utils/chrome/storage';
import AuthView from './AuthView';
import Notifications from './Notifications';
import Profile from './Profile';
import './style.scss';

export default function Popup() {
  const [loading, setLoading] = useState(true);

  /**
   * State for all components in Popup.
   */
  const [notifications, setNotifications] = useState<Notification[]>([]);

  /**
   * Global state.
   */
  const [isExtensionOn, setIsExtensionOn] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setLoading(true)
    get({
      isAuthenticated: false,
      isExtensionOn: false,
      user: null
    }).then((items) => {
      setIsAuthenticated(items.isAuthenticated);
      if (items.isAuthenticated) {
        setIsExtensionOn(items.isExtensionOn);
        setUser(new User(items.user));
      }
      setLoading(false)
    });

    chrome.storage.onChanged.addListener((change) => {
      if (change.isExtensionOn !== undefined)   setIsExtensionOn(change.isExtensionOn.newValue);
      if (change.isAuthenticated !== undefined) setIsAuthenticated(change.isAuthenticated.newValue);
      if (change.user !== undefined)            setUser(new User(change.user.newValue));
    });
  }, []);

  const handleLogout = async () => {
    const items = await get(null)
    await remove(Object.keys(items))
    await set({ isAuthenticated: false })
  }

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
    if (!isAuthenticated) return;
    await set({ isExtensionOn: checked });
  }
  
  if (loading) return <div className="TbdPopupContainer--loading"/>
  return (
    <div className="TbdPopupContainer">
      {isAuthenticated ? (
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
      ) : (
        <AuthView />
      )}
      <div className="TbdPopupContainer__BottomWrapper">
        <div className="TbdPopupContainer__OnOffWrapper">
          <div className="TbdPopupContainer__OnOffTextWrapper">
            <div>Turn Accord</div>
            <div className="TbdPopupContainer__OnOff">{isExtensionOn ? 'OFF' : 'ON'}</div>
          </div>
          <Switch onClick={(checked) => { handleOnOff(checked); }} checked={isExtensionOn} />
        </div>
        {isAuthenticated ? (
          <div className='TbdPopupContainer__ButtonWrapper'>
            {!loading ? (
              <button
                className='TbdPopupContainer__Button'
                onClick={handleLogout}
              >
                logout
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
