import { EditOutlined, LoadingOutlined, SaveOutlined } from '@ant-design/icons';
import React, { useState } from 'react';
import { User } from '../../../models';
import { updateColor, updateDisplayName, updateUsername } from '../../../server';
import { validateDisplayName, validateUsername } from '../../../utils';
import { set } from '../../../utils/chromeStorage';
import '../style.scss';
import ColorPicker from './ColorPicker';
import './style.scss';

interface ProfileProps {
  user: User;
}

export default function Profile({ user }: ProfileProps) {
  const [showEditIcon, setShowEditIcon] = useState<'displayName' | 'username' | 'color' | null>(null);
  const [editable, setEditable] = useState<'displayName' | 'username' | 'color' | null>(null);
  const [loading, setLoading] = useState<'displayName' | 'username' | 'color' | null>(null);

  const [displayName, setDisplayName] = useState(user.displayName);
  const [username, setUsername] = useState(user.username);

  const [showError, setShowError] = useState<'displayName' | 'username' | 'color' | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleEditProperty = (property: 'displayName' | 'username' | 'color') => {
    if (editable !== null) return;
    setEditable(property); 
    setShowEditIcon(null);
  }

  const saveDisplayName = async () => {
    setLoading('displayName');
    const vRes = validateDisplayName(displayName)
    if (!vRes.success) {
      setShowError('displayName');
      setErrorMessage(vRes.message || 'Please enter a name!');
      setLoading(null);
      return;
    }
    const res = await updateDisplayName(displayName);
    if (!res.error && res.user) {
      await set({ user: res.user });
      setEditable(null);
    } else if (res.error) {
      setShowError('displayName');
      setErrorMessage(res.error.message);
    }
    setLoading(null);
  }

  const saveUsername = async () => {
    setLoading('username');
    const vRes = validateUsername(username)
    if (!vRes.success) {
      setShowError('username');
      setErrorMessage(vRes.message || 'Invalid username!');
      setLoading(null);
      return;
    }
    const res = await updateUsername(username);
    if (!res.error && res.user) {
      await set({ user: res.user });
      setEditable(null);
    } else if (res.error) {
      setShowError('username');
      setErrorMessage(res.error.message);
    }
    setLoading(null);
  }

  const saveColor = async (newColor: string) => {
    setLoading('color');
    const res = await updateColor(newColor);
    if (!res.error && res.user) {
      await set({ user: res.user });
      setEditable(null);
    } else if (res.error) {
      setShowError('color');
      setErrorMessage(res.error.message);
    }
    setLoading(null);
  }

  return (
    <div className="TbdProfile__Wrapper">
      <div className="TbdProfile__Header">
        <div
          className="TbdProfile__Img"
          style={{ backgroundColor: user.color }} 
        >
          {displayName[0]}
        </div>
        <div className="TbdProfile__HeaderContent">
          {editable === 'displayName' ? (
            <div className="TbdProfile__InputWrapper">
              <input
                autoFocus
                className="TbdProfile__Input TbdProfile__Input--display-name"
                value={displayName} 
                onChange={(e) => { setDisplayName(e.target.value) }}
              />
              <div 
                className="TbdProfile__SaveIcon TbdProfile__SaveIcon--display-name"
                onClick={saveDisplayName}
              >
                {loading === 'displayName' ? <LoadingOutlined /> : <SaveOutlined />}
              </div>
            </div>
          ) : (
            <div 
              onClick={() => { handleEditProperty('displayName') }}
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
          {editable === 'username' ? (
            <div className="TbdProfile__InputWrapper">
              <div className="TbdProfile__InputPrefix" style={{ color: user.color }}>@</div>
              <input
                autoFocus
                style={{ color: user.color }}
                className="TbdProfile__Input TbdProfile__Input--username"
                value={username} 
                onChange={(e) => { setUsername(e.target.value) }}
              />
              <div 
                className="TbdProfile__SaveIcon TbdProfile__SaveIcon--username"
                onClick={saveUsername}
              >
                {loading === 'username' ? <LoadingOutlined /> : <SaveOutlined />}
              </div>
            </div>
          ) : (
            <div
              onClick={() => { handleEditProperty('username') }}
              onMouseEnter={() => { setShowEditIcon('username') }} 
              onMouseLeave={() => { setShowEditIcon(null) }}
              style={{ color: user.color }}
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
          )}
        </div>
      </div>
      {editable === 'color' ? (
        <div className="TbdProfile__Color TbdProfile__InputWrapper">
          <div className="TbdProfile__ColorText">Accent Color</div>
          <ColorPicker onSelect={saveColor} />
        </div>
      ) : (
        <div
          onClick={() => { handleEditProperty('color') }}
          onMouseEnter={() => { setShowEditIcon('color') }} 
          onMouseLeave={() => { setShowEditIcon(null) }}
          className="TbdProfile__Color"
        >
          <div className="TbdProfile__ColorText">Accent Color</div>
          <div className="TbdProfile__ColorPreview" style={{ backgroundColor: user.color }} />
          <div 
            style={showEditIcon !== 'color' ? { opacity: 0 } : {}} 
            className="TbdProfile__EditIcon"
          >
            <EditOutlined />
          </div>
        </div>
      )}
    </div>
  );
}
