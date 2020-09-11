import { Tabs } from 'antd';
import 'antd/dist/antd.min.css';
import React, { useEffect, useState } from 'react';
import { Notification as INotification, User as IUser } from '../../models';
import { notifications as notificationData, users as userData } from '../../utils/data';
import Notification from './Notification';
import Profile from './Profile';
import './style.scss';

function Popup() {
  const [user, setUser] = useState<IUser | null>(null)
  const [notifications, setNotifications] = useState<INotification[]>([])

  /**
   * Fetch current User.
   */
  useEffect(() => {
    const fetchUser = async (): Promise<void> => {
      // fetch from globalStore, which is chrome storage. re-render when that changes (in dependency list)
      const user = userData.find(user => user.username === 'ali')!
      setUser(user)
    }
    fetchUser();
  }, [])

  /**
   * Establish socket to receive notifications.
   */
  useEffect(() => {
    const fetchNotifications = async (): Promise<void> => {
      const n = notificationData[0]
      setNotifications([n, n, n, n, n, n, n, n, n, n, n])
    }
    fetchNotifications();
  }, [])

  return (
    <div className="TbdPopupContainer">
      <Tabs defaultActiveKey="1">
        <Tabs.TabPane tab="notifications" key="1">
          {notifications.map(n => (
            <Notification key={n.id} notification={n} />
          ))}
        </Tabs.TabPane>
        <Tabs.TabPane tab="profile" key="2">
          {user && <Profile user={user} />}
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default Popup;