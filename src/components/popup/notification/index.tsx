import React from 'react';
// import INotification from '../../../state/stores/objects/Notification';
import './style.scss';

interface NotificationProps {
  notification: any
  // notification: INotification
}

const Notification = ({ notification }: NotificationProps) => {
  
  const renderContent = (content: string) => {
    let displayContent: any[] = [];
    let prevStopIndex = 0;
    let findingTag = false;
    for (let i=0; i<content.length; i++) {
      if (!findingTag && content[i] !== '@') continue
      else if (!findingTag && content[i] === '@') {
        findingTag = true
        displayContent.push(<div>{content.substring(prevStopIndex, i)}</div>)
        prevStopIndex = i
      } else if (findingTag && i - prevStopIndex >= 3) {
        const potentialUsername = content.substring(prevStopIndex, i)
        const user = notification.taggedUsers.find(user => user.username === potentialUsername)
        if (!user) continue
        else {
          findingTag = false
          displayContent.push(<div>{content.substring(prevStopIndex, i)}</div>)
          prevStopIndex = i
        }
      }
    }
    displayContent.push(<div>{content.substring(prevStopIndex, content.length)}</div>)
    // div issue here unique key
    return <div>{ displayContent.map(div => div) }</div>
  }
 
	return (
    <div className='TbdNotificationContainer'>
      <div className='TbdNotificationContainer__header-wrapper'>
        <div 
          className='TbdPopupContainer__profile-img'
          style={{backgroundColor: notification.creator.color}}
        />
        <div className='TbdNotificationContainer__header-content-wrapper'>
          <div className='TbdNotificationContainer__notification'>
            <span 
              style={{color: notification.creator.color}}
              className='TbdText--medium TbdNotificationContainer__display-name'
            >
              {`${notification.creator.displayName} `}
            </span>
            {notification.action}
          </div>
          <div className='TbdNotificationContainer__notification-details'>
            {`${notification.time} · ${notification.url}`}
          </div>
        </div>
      </div>
      <div className='TbdNotificationContainer__content'>
        { renderContent(notification.content) }
      </div>
    </div>
	)
};

export default Notification;