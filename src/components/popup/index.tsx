import { EditOutlined } from '@ant-design/icons';
import { Tabs } from 'antd';
import 'antd/dist/antd.min.css';
import { observer } from 'mobx-react';
import React, { useState } from 'react';
import IPost from '../../models/Post';
import NotificationObject from '../../objects/Notification';
import { users } from '../../utils/data';
import Notification from './Notification';
import './style.scss';
import './tabs.scss';

const Popup = observer(() => {

  // useEffect(() => {
  //   // Example of how to send a message to eventPage.ts.
  //   chrome.runtime.sendMessage({ popupMounted: true });
  // }, []);

  const [notifications, setNotifications] = useState<NotificationObject[]>([])
  const [showEdit, setShowEdit] = useState<string | null>(null)

  // userStore
  const [color, setColor] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')

  // need to actually pull data from server.. decide on how we deal with frontend data
  const user = users.find(user => user.username === 'ali')!
  setColor(user.color)
  setDisplayName(user.displayName)
  setUsername(user.username)

  const post: IPost = {
    id: '4ff4be94-b0ac-4da5-9224-652993095c25',
    content: '@aki yo check this out',
    creationDatetime: 1599521212817,
    creator: {
      id: '30a8a9d3-2d42-454e-ab5d-1e1ebb6abd93',
      username: 'aki',
      displayName: 'Akshath Sivaprasad',
      color: '#9900EF'
    },
    creatorUserId: 'fce65bd0-8af5-4504-a19d-8cbc767693f7',
    replies: [],
    taggedUserIds: ['30a8a9d3-2d42-454e-ab5d-1e1ebb6abd93'],
    taggedUsers: [
      {
        id: 'fce65bd0-8af5-4504-a19d-8cbc767693f7',
        isTaggedInReply: false,
        username: 'ali',
        color: '#52B2FA'
      }
    ],
    url: 'https://github.com/airbnb/css#comments'
  }
  const n = new NotificationObject(post)
  setNotifications([n, n, n, n, n, n, n, n, n, n])

  return (
    <div className='TbdPopupContainer'>
      <Tabs defaultActiveKey='1'>
        <Tabs.TabPane tab='notifications' key='1'>
          <div className='TbdPopupContainer__notification-wrapper'>
          {
            notifications.map(n => {
              return <Notification key={n.id} notification={n} />
            })
          }
          </div>
        </Tabs.TabPane>
        <Tabs.TabPane tab='profile' key='2'>
          <div className='TbdPopupContainer__profile-wrapper'>
            <div className='TbdPopupContainer__header'>
              <div 
                className='TbdText--large TbdPopupContainer__profile-img'
                style={{backgroundColor: color}} 
              >
                {displayName[0]}
              </div>
              <div className='TbdPopupContainer__profile-header-content'>
                <div 
                  onClick={() => {}}
                  onMouseEnter={() => setShowEdit('displayName')} 
                  onMouseLeave={() => setShowEdit(null)}
                  className='TbdText--medium TbdPopupContainer__display-name'
                >
                  {displayName}
                  <div 
                    style={showEdit !== 'displayName' ? {opacity: 0} : {}}
                    className='TbdPopupContainer__edit-icon'
                  >
                    <EditOutlined />
                  </div>
                </div>
                <div 
                  onClick={() => {}}
                  onMouseEnter={() => setShowEdit('username')} 
                  onMouseLeave={() => setShowEdit(null)}
                  className='TbdText TbdPopupContainer__username'
                >
                  {`@${username}`}
                  <div 
                    style={showEdit !== 'username' ? {opacity: 0} : {}}
                    className='TbdPopupContainer__edit-icon'
                  >
                    <EditOutlined />
                  </div>
                </div>
              </div>
            </div>
            <div className='TbdPopupContainer__accent-color-wrapper '>
              <div className='TbdText'>Accent Color</div>
              <div 
                onClick={() => {}}
                className='TbdPopupContainer__color'
                style={{backgroundColor: color}}
              />
            </div>
          </div>
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
});

export default Popup;