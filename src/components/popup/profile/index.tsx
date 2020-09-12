import { EditOutlined } from '@ant-design/icons';
import React, { useState } from 'react';
import { User } from '../../../models';
import '../style.scss';
import './style.scss';

interface ProfileProps {
  user: User;
}

export default function Profile({ user }: ProfileProps) {
  const [showEditIcon, setShowEditIcon] = useState<'displayName' | 'username' | null>(null);

  const [editable, setEditable] = useState<'displayName' | 'username' | null>(null);

  const [displayName, setDisplayName] = useState(user.displayName);
  const [username, setUsername] = useState(user.username);
  const [color, setColor] = useState(user.color);

  return (
    <div className="TbdProfile__Wrapper">
      <div className="TbdProfile__Header">
        <div 
          className="TbdProfile__Img"
          style={{ backgroundColor: color }} 
        >
          {displayName[0]}
        </div>
        <div className="TbdProfile__HeaderContent">
          {editable === 'displayName' ? (
            <div 
              onClick={() => { setEditable('displayName') }}
              className="TbdProfile__DisplayName"
            >
              {displayName}
              <div 
                style={showEditIcon !== 'displayName' ? { opacity: 0 } : {}}
                className="TbdProfile__EditIcon"
              >
                <EditOutlined />
              </div>
            </div>
          ) : (
            <div 
              onClick={() => { setEditable('displayName') }}
              onMouseEnter={() => { setShowEditIcon('displayName') }}
              onMouseLeave={() => { setShowEditIcon(null) }}
              className="TbdProfile__DisplayName"
            >
              {displayName}
              <div 
                style={showEditIcon !== 'displayName' ? { opacity: 0 } : {}}
                className="TbdProfile__EditIcon"
              >
                <EditOutlined />
              </div>
            </div>
          )}

          <div
            onClick={() => { setEditable('username') }}
            onMouseEnter={() => { setShowEditIcon('username') }} 
            onMouseLeave={() => { setShowEditIcon(null) }}
            style={{ color }}
            className="TbdProfile__Username"
          >
            {`@${username}`}
            <div 
              style={showEditIcon !== 'username' ? { opacity: 0 } : {}}
              className="TbdProfile__EditIcon"
            >
              <EditOutlined />
            </div>
          </div>
        </div>
      </div>
      <div className="TbdProfile__AccentColorWrapper">
        <div className="TbdText">Accent Color</div>
        <div 
          onClick={() => {}}
          className="TbdProfile__Color"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}
