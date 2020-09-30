import React from 'react';
import { Notification as INotification } from '../../../models/nodes/Notification';
import { displayRelativeTime } from '../../../utils';
import '../style.scss';
import './style.scss';

interface NotificationProps {
  notification: INotification;
}

const Notification = ({ notification }: NotificationProps) => {
  
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
 
	return (
    <div className="TbdNotificationWrapper">
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
              {notification.action}
            </span>
          </div>
          <div className="TbdNotificationWrapper__NotificationDetails">
            {`${displayRelativeTime(notification.creationDatetime)} · ${notification.url}`}
          </div>
        </div>
      </div>
      <div className="TbdNotificationWrapper__Content">
        {notification.content && renderContent(notification.content)}
      </div>
    </div>
	)
};

export default Notification;