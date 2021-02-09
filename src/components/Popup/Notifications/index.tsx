import React from 'react';
import NotificationObject from '../../../entities/Notification';
import Notification from './Notification';
import './style.scss';

interface NotificationsProps {
  notifications: NotificationObject[];
}

export default function Notifications({ notifications }: NotificationsProps) {
  if (notifications.length === 0) {
    return <div className="TroveNotifications__Empty">No new notifications.</div>;
  } else
    return (
      <div className="TroveNotificationWrapper">
        {notifications.map((n) => (
          <Notification key={n.id} notification={n} />
        ))}
      </div>
    );
}
