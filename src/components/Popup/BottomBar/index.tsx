import { LoadingOutlined } from '@ant-design/icons';
import { Switch } from 'antd';
import React, { useState } from 'react';
import { socket } from '../../../app/background';
import { MessageType, sendMessageToWebsite } from '../../../utils/chrome/external';
import { get, remove, set } from '../../../utils/chrome/storage';
import './style.scss';

interface BottomBarProps {
  isExtensionOn: boolean;
}

export default function BottomBar({ isExtensionOn }: BottomBarProps) {
  const [logoutLoading, setLogoutLoading] = useState(false);

  /**
   * Logout. Clear chrome storage. Leave socket room.
   */
  const handleLogout = async () => {
    setLogoutLoading(true);
    const items = await get(null);
    if (items?.user?.id) socket.emit('leave room', items.user.id);
    await remove(Object.keys(items));
    await set({ isAuthenticated: false });
    sendMessageToWebsite({ type: MessageType.Logout });
    setLogoutLoading(false);
  }

  /**
   * Turn extension on/off. Save to global state.
   * @param checked New global on/off value.
   */
  const handleOnOff = async (checked: boolean) => {
    await set({ isExtensionOn: checked });
  }

  return (
    <div className="TbdPopupContainer__BottomWrapper">
      <div className="TbdPopupContainer__OnOffWrapper">
        <div className="TbdPopupContainer__OnOffTextWrapper">
          {/* <div>Turn Trove</div> */}
          <div 
            className={`TbdPopupContainer__OnOff ${!isExtensionOn && "TbdPopupContainer__OnOff--bold"}`}
          >
            {isExtensionOn ? 'On' : 'Off'}
          </div>
        </div>
        <Switch onClick={(checked) => handleOnOff(checked)} checked={isExtensionOn} />
      </div>
      <div className='TbdPopupContainer__ButtonWrapper'>
        {!logoutLoading ? (
          <button
            className='TbdPopupContainer__Button'
            onClick={handleLogout}
          >
            Logout
          </button>
        ) : (
          <div className='TbdPopupContainer__Loading'>
            <LoadingOutlined />
          </div>
        )}
      </div>
    </div>
  );
};
