import Color from 'color';
import React, { useState } from 'react';
import { ORIGIN } from '../../../../config/config.dev';
import User from '../../../../entities/User';
import { MessageType, sendMessageToExtension } from '../../../../utils/chrome/tabs';

interface UserInfoProps {
  user: User
}
const UserInfo = ({ user }: UserInfoProps) => {
  const [profileImgHovered, setProfileImgHovered] = useState(false);
  const [profileNameHovered, setProfileNameHovered] = useState(false);

  const handleGoToProfile = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    sendMessageToExtension({ type: MessageType.OpenTab, url: `${ORIGIN}/${user.username}` });
  };

  return (
    <div className="TroveTooltip__Profile">
      <div
        className={`TroveTooltip__ProfileImg ${profileImgHovered ? 'TroveTooltip__ProfileImg--hover' : ''}`}
        style={{
          backgroundColor: user.color,
          color: Color(user.color).isLight() ? 'black' : 'white',
        }}
        onMouseEnter={() => setProfileImgHovered(true)}
        onMouseLeave={() => setProfileImgHovered(false)}
        onClick={(e) => handleGoToProfile(e)}
      >
        {user.displayName[0]}
      </div>
      <div
        className={`TroveTooltip__ProfileInfo ${profileNameHovered ? 'TroveTooltip__ProfileInfo--hover' : ''}`}
        onClick={(e) => handleGoToProfile(e)}
        style={{ textDecorationColor: user.color }}
        onMouseEnter={() => setProfileNameHovered(true)}
        onMouseLeave={() => setProfileNameHovered(false)}
      >
        <div className="TroveTooltip__DisplayName">{user.displayName}</div>
        <div className="TroveTooltip__Username" style={{ color: user.color }}>
          {`@${user.username}`}
        </div>
      </div>
    </div>
  )
};

export default UserInfo;