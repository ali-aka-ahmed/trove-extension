import { Tabs } from 'antd';
import React, { useEffect, useState } from 'react';
import { Notification as INotification, User as IUser } from '../../models';
import { users } from '../../utils/data';
import Notification from './Notification';
import Profile from './Profile';
import './style.scss';
import './tabs.scss';

function Popup() {
  const [user, setUser] = useState<IUser | null>(null)
  const [notifications, setNotifications] = useState<INotification[]>([])

  useEffect(() => {
    const fetchUser = async (): Promise<void> => {
      // fetch from globalStore, which is chrome storage. re-render when that changes (in dependency list)
      const user = users.find(user => user.username === 'ali')!
      setUser(user)
    }
    fetchUser()
  }, [])

  useEffect(() => {
    const fetchNotifications = async (): Promise<void> => {
      setNotifications([])
    }
    fetchNotifications()
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