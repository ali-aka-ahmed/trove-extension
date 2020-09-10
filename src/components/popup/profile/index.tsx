import { EditOutlined } from '@ant-design/icons';
import React, { useState } from 'react';
import { User } from '../../../models';
import './index.scss';

interface ProfileProps {
  user: User;
}

export default function Profile({ user }: ProfileProps) {
  const [showEdit, setShowEdit] = useState<string | null>(null)

  return (
    <div className="TbdProfile__Wrapper">
      <div className="TbdProfile__Header">
        <div 
          className="TbdProfile__Img"
          style={{ backgroundColor: user.color }} 
        >
          {user.displayName[0]}
        </div>
        <div className="TbdProfile__HeaderContent">
          <div 
            onClick={() => {}}
            onMouseEnter={() => { setShowEdit('displayName') }}
            onMouseLeave={() => { setShowEdit(null) }}
            className="TbdProfile__DisplayName"
          >
            {user.displayName}
            <div 
              style={showEdit !== 'displayName' ? { opacity: 0 } : {}}
              className="TbdProfile__EditIcon"
            >
              <EditOutlined />
            </div>
          </div>
          <div
            onClick={() => {}}
            onMouseEnter={() => { setShowEdit('username') }} 
            onMouseLeave={() => { setShowEdit(null) }}
            className="TbdProfile__Username"
          >
            {`@${user.username}`}
            <div 
              style={showEdit !== 'username' ? { opacity: 0 } : {}}
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
          style={{ backgroundColor: user.color }}
        />
      </div>
    </div>
  );
}
