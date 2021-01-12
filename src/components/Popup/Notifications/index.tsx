import React from 'react';
import NotificationObject from '../../../entities/Notification';
import Notification from './Notification';
import './style.scss';

interface NotificationsProps {
  notifications: NotificationObject[];
}

export default function Notifications({ notifications }: NotificationsProps) {
  if (notifications.length === 0) {
    return (
      <div className="TroveNotifications__Empty">
        No new notifications 🤟
      </div>
    )
  }
  return (
    <>
      {notifications.map(n => (
        <Notification key={n.id} notification={n} />
      ))}
    </>
  )
};
