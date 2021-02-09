import Color from 'color';
import React from 'react';
import { ORIGIN } from '../../../../config';
import NotificationObject from '../../../../entities/Notification';
import { get1, set } from '../../../../utils/chrome/storage';
import { sendMessageToExtension, SocketMessageType } from '../../../../utils/chrome/tabs';
import Content from '../../../content';
import '../../style.scss';
import '../style.scss';
import './style.scss';

interface NotificationProps {
  notification: NotificationObject;
}

export default function Notification({ notification }: NotificationProps) {
  const handleClick = async () => {
    sendMessageToExtension({
      type: SocketMessageType.ReadNotification,
      notificationId: notification.id,
    });
    const ns: NotificationObject[] = await get1('notifications');
    const i = ns.findIndex((n) => n.id === notification.id);
    notification.read = true;
    ns[i] = notification;
    await set({ notifications: ns });
    if (notification.url) {
      chrome.tabs.create({ url: notification.url, active: false });
    } else {
      chrome.tabs.create({ url: `${ORIGIN}/${notification.sender.username}`, active: false });
    }
  };
  return (
    <div
      className="TbdNotificationWrapper"
      onClick={handleClick}
    >
      <div className="TbdNotificationWrapper__HeaderWrapper">
        <div
          className="TbdProfile__Img"
          style={{
            backgroundColor: notification.sender.color,
            color: Color(notification.sender.color).isLight() ? 'black' : 'white',
          }}
        >
          {notification.sender.displayName[0]}
        </div>
        <div className="TbdNotificationWrapper__HeaderContentWrapper">
          <div className="TbdNotificationWrapper__Notification">
            <span className="TbdNotificationWrapper__DisplayName">
              {`${notification.sender.displayName} `}
            </span>
            <span className="TbdNotificationWrapper__Action">{notification.action}</span>
          </div>
          <div className="TbdNotificationWrapper__NotificationDetails">
            {`${notification.timeAgo} ${
              notification.displayUrl ? `· ${notification.domain}${notification.path}` : ''
            }`}
          </div>
        </div>
      </div>
      {notification.content && (
        <div className="TbdNotificationWrapper__Content">
          <Content
            value={notification.content}
            taggedUsers={notification.taggedUsers || []}
            style={{ maxHeight: '70px', overflow: 'hidden' }}
          />
        </div>
      )}
    </div>
  );
}
