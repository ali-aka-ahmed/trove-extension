import { EditOutlined } from '@ant-design/icons';
import { Tabs } from 'antd';
import 'antd/dist/antd.min.css';
import { observer } from 'mobx-react';
import React, { useState } from 'react';
import { rLogin } from '../../server';
import { useStores } from '../../state';
import Notification from './notification';
import './style.scss';
import './tabs.scss';

const Popup = observer(() => {
  const { userStore, popupStore } = useStores();
  // useEffect(() => {
  //   // Example of how to send a message to eventPage.ts.
  //   chrome.runtime.sendMessage({ popupMounted: true });
  // }, []);

  const [showEdit, setShowEdit] = useState<string | null>(null)

  console.log('>>>>>>', userStore)
  console.log('hola')

  const user = rLogin()
  userStore.update(user)

  return (
    <div className='TbdPopupContainer'>
      <Tabs defaultActiveKey='1'>
        <Tabs.TabPane tab='notifications' key='1'>
          <div className='TbdPopupContainer__notification-wrapper'>
          {
            popupStore.notifications.map(n => {
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
                style={{backgroundColor: userStore.color}} 
              >
                {userStore.displayName[0]}
              </div>
              <div className='TbdPopupContainer__profile-header-content'>
                <div 
                  onClick={() => {}}
                  onMouseEnter={() => setShowEdit('displayName')} 
                  onMouseLeave={() => setShowEdit(null)}
                  className='TbdText--medium TbdPopupContainer__display-name'
                >
                  {userStore.displayName}
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
                  {`@${userStore.username}`}
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
                style={{backgroundColor: userStore.color}}
              />
            </div>
          </div>
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
});

export default Popup;