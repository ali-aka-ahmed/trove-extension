import React from 'react';
import { Notification as INotification } from '../../../models';
import { displayRelativeTime } from '../../../utils';
import './style.scss';
import '../style.scss';

interface NotificationProps {
  notification: INotification
}

const Notification = ({ notification }: NotificationProps) => {
  
  const renderContent = (content: string) => {
    const regex = new RegExp(`(${notification.taggedUsers?.map(user => `@${user.username}`).join('|')})`);
    const tokenizedContent = content.split(regex).filter(str => !!str);
    const isUsername = (str: string) => { return str[0] === '@' };
    const getColor = (tag: string) => { 
      return notification.taggedUsers?.find(user => user.username === tag.slice(1))?.color; 
    }
    return (
      <div>
        {tokenizedContent.map(subString => 
          <span 
            key={subString}
            className={isUsername(subString)
              ? 'TbdNotificationContent--Username' 
              : 'TbdNotificationContent--Normal'
            }
            style={isUsername(subString) ? { color: getColor(subString) } : {}}
          >
            {subString}
          </span>
        )}
      </div>
    )
  }
 
	return (
    <div className='TbdNotificationContainer'>
      <div className='TbdNotificationContainer__HeaderWrapper'>
        <div 
          className='TbdProfile__Img'
          style={{ backgroundColor: notification.sender.color }}
        />
        <div className='TbdNotificationContainer__HeaderContentWrapper'>
          <div className='TbdNotificationContainer__Notification'>
            <span 
              style={{color: notification.sender.color}}
              className='TbdNotificationContainer__DisplayName'
            >
              {`${notification.sender.displayName} `}
            </span>
            {notification.action}
          </div>
          <div className='TbdNotificationContainer__NotificationDetails'>
            {`${displayRelativeTime(notification.creationDatetime)} · ${notification.url}`}
          </div>
        </div>
      </div>
      <div className='TbdNotificationContainer__Content'>
        {notification.content && renderContent(notification.content)}
      </div>
    </div>
	)
};

export default Notification;