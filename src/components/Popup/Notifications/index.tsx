import React from 'react';
import NotificationObject from '../../../entities/Notification';
import Notification from './Notification';

interface NotificationsProps {
  notifications: NotificationObject[];
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
