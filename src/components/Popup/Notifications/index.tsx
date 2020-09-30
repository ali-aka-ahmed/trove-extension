import React from 'react';
import CNotification from '../helpers/Notification';
import Notification from './Notification';

interface NotificationsProps {
  notifications: CNotification[];
}

export default function Notifications({ notifications }: NotificationsProps) {
  return (
    <>
      {notifications.map(n => (
        <Notification key={n.id} notification={n} />
      ))}
    </>
  )
};
