import React from 'react';
import { socket } from '../../../../app/background';
import NotificationObject from '../../../../entities/Notification';
import { get1, set } from '../../../../utils/chrome/storage';
import '../../style.scss';
import '../style.scss';
import './style.scss';

interface NotificationProps {
  notification: NotificationObject;
}

export default function Notification({ notification }: NotificationProps) {
  
  const renderContent = (content: string) => {
    const regex = new RegExp(`(${notification.taggedUsers?.map(user => `@${user.username}`).join('|')})`);
    const tokenizedContent = content.split(regex).filter(str => !!str);
    const isUsername = (str: string): boolean => { return str[0] === '@' };
    const getUserColor = (tag: string): string | undefined => { 
      return notification.taggedUsers?.find(user => user.username === tag.slice(1))?.color; 
    }
    return (
      <>
        {tokenizedContent.map((subString, i) => 
          <span key={i} style={isUsername(subString) ? { color: getUserColor(subString) } : {}}>
            {subString}
          </span>
        )}
      </>
    )
  }

  const handleClick = async () => {
    socket.emit('read notification', notification.id);
    const ns: NotificationObject[] = await get1('notifications')
    const i = ns.findIndex((n) => n.id === notification.id)
    notification.read = true
    ns[i] = notification
    await set({ notifications: ns })
  }

	return (
    <div 
      className={`TbdNotificationWrapper ${!notification.read && 'TbdNotificationWrapper--unread'}`} 
      onClick={() => handleClick()}
    >
      <div className="TbdNotificationWrapper__HeaderWrapper">
        <div className="TbdProfile__Img" style={{ backgroundColor: notification.sender.color }}>
          {notification.sender.displayName[0]}
        </div>
        <div className="TbdNotificationWrapper__HeaderContentWrapper">
          <div className="TbdNotificationWrapper__Notification">
            <span className="TbdNotificationWrapper__DisplayName">
              {`${notification.sender.displayName} `}
            </span>
            <span className="TbdNotificationWrapper__Action">
              tagged you
            </span>
          </div>
          <div className="TbdNotificationWrapper__NotificationDetails">
            {`${notification.time} · ${notification.url}`}
          </div>
        </div>
      </div>
      <div className="TbdNotificationWrapper__Content">
        {notification.content && renderContent(notification.content)}
      </div>
    </div>
	)
};
