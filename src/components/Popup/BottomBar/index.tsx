import { LoadingOutlined } from '@ant-design/icons';
import { Switch } from 'antd';
import React, { useState } from 'react';
import { set } from '../../../utils/chrome/storage';
import { MessageType, sendMessageToExtension } from '../../../utils/chrome/tabs';
import '../style.scss';
import './style.scss';

interface BottomBarProps {
  isExtensionOn: boolean;
}

export default function BottomBar({ isExtensionOn }: BottomBarProps) {
  const [logoutLoading, setLogoutLoading] = useState(false);

  /**
   * Logout. Clear chrome storage. Leave socket room.
   */
  // const handleLogout = async () => {
  //   setLogoutLoading(true);
  //   const items = await get(null);
  //   if (items?.user?.id)
  //     sendMessageToExtension({ type: SocketMessageType.LeaveRoom, userId: items.user.id });
  //   sendMessageToWebsite({ type: MessageType.Logout });
  //   await remove(Object.keys(items));
  //   await set({ isAuthenticated: false });
  // };

  /**
   * Turn extension on/off. Save to global state.
   * @param checked New global on/off value.
   */
  const handleOnOff = async (checked: boolean) => {
    await set({ isExtensionOn: checked });
  };

  const goToFeedback = () => {
    sendMessageToExtension({ type: MessageType.OpenTab, url: 'https://www.notion.so/simplata/Trove-Community-Board-c2c9fe006c29404b967497ae2d2f3079', active: true })
  }

  return (
    <div className="TbdPopupContainer__BottomWrapper">
      <div className="TbdPopupContainer__OnOffWrapper">
        <div className="TbdPopupContainer__OnOffTextWrapper">
          <div
            className={`TbdPopupContainer__OnOff ${
              !isExtensionOn && 'TbdPopupContainer__OnOff--bold'
            }`}
          >
            {`Trove is ${isExtensionOn ? 'On' : 'Off'}`}
          </div>
        </div>
        <Switch onClick={(checked) => handleOnOff(checked)} checked={isExtensionOn} />
      </div>
      <div className="TbdPopupContainer__ButtonWrapper">
        <button className="Trove__Button" onClick={goToFeedback}>
          {logoutLoading && (
            <div className="TbdPopupContainer__Loading">
              <LoadingOutlined />
            </div>
          )}
          Give Feedback
        </button>
      </div>
    </div>
  );
}
