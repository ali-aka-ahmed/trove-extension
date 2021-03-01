import { EditOutlined, LoadingOutlined } from '@ant-design/icons';
import { Alert } from 'antd';
import React, { useState } from 'react';
import { IUserRes } from '../../../app/server/users';
import IUser from '../../../models/IUser';
import { MessageType as EMessageType, sendMessageToWebsite } from '../../../utils/chrome/external';
import { set } from '../../../utils/chrome/storage';
import { MessageType, sendMessageToExtension } from '../../../utils/chrome/tabs';
import ColorPicker from '../../colorPicker';
import { validateDisplayName, validateUsername } from '../helpers/auth';
import '../style.scss';
import './style.scss';

interface ProfileProps {
  user: IUser;
}

// space in profile.
// (change chromeStorage storing to space, not spaceId. reference everywhere else with that logic. then get it in top level and funnel down).
// onClick getSpaces and display information. onChange change the space.

export default function Profile({ user }: ProfileProps) {
  const [showEditIcon, setShowEditIcon] = useState<'displayName' | 'username' | 'color' | null>(
    null
  );
  const [editable, setEditable] = useState<'displayName' | 'username' | 'color' | null>(null);
  const [loading, setLoading] = useState<'displayName' | 'username' | 'color' | null>(null);

  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');

  const [showError, setShowError] = useState<'displayName' | 'username' | 'color' | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleEditProperty = (property: 'displayName' | 'username' | 'color') => {
    if (editable !== null) return;
    setEditable(property);
    setShowEditIcon(null);
  };

  const updateProfile = async (args: {
    color?: string;
    username?: string;
    displayName?: string;
  }) => {
    let argString: 'color' | 'username' | 'displayName' | null = null;
    if (args.color) argString = 'color';
    else if (args.username) argString = 'username';
    else if (args.displayName) argString = 'displayName';

    if (
      args.color === user.color ||
      args.username === user.username ||
      args.displayName === user.displayName
    ) {
      setEditable(null);
      setShowError(null);
      return;
    }
    setLoading(argString);

    if (args.username || args.displayName) {
      const vRes = args.username ? validateUsername(username) : validateDisplayName(displayName);
      if (!vRes.success) {
        setShowError(argString);
        setErrorMessage(vRes.message || 'Invalid. Try again!');
        setLoading(null);
        return;
      }
    }

    sendMessageToExtension({
      type: MessageType.UpdateUser,
      updateUserArgs: args,
    }).then((res: IUserRes) => {
      if (res.success) {
        set({ user: res.user }).then(() => {
          setEditable(null);
          setShowError(null);
        });
        sendMessageToWebsite({ type: EMessageType.UpdateProfile, user: res.user });
      } else {
        setShowError(argString);
        setErrorMessage(res.message);
      }
    });
    setLoading(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, onPressEnterFn: () => void) => {
    if (e.key === 'Enter') onPressEnterFn();
  };

  return (
    <div className="TbdProfile__Wrapper">
      {/* <div className="TbdProfile__Header">
        <div
          className="TbdProfile__Img"
          style={{
            backgroundColor: user.color,
            color: Color(user.color).isLight() ? 'black' : 'white',
          }}
        >
          {displayName[0]}
        </div>
        <div className="TbdProfile__HeaderContent">
          {editable === 'displayName' ? (
            <div className="TbdProfile__EditDisplayName EditProp">
              <input
                autoFocus
                style={{ width: `${(displayName.length + 1) * 8}px` }}
                className="TbdProfile__Input TbdProfile__Input--display-name"
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                }}
                onKeyDown={(e) => handleKeyDown(e, () => updateProfile({ displayName }))}
              />
              <div className="TbdProfile__Icon" onClick={() => updateProfile({ displayName })}>
                {loading === 'displayName' ? <LoadingOutlined /> : <SaveOutlined />}
              </div>
              <div
                className="TbdProfile__Icon TbdProfile__Icon--close"
                onClick={() => setEditable(null)}
              >
                {loading !== 'displayName' && <CloseOutlined />}
              </div>
            </div>
          ) : (
            <div
              onClick={() => {
                handleEditProperty('displayName');
              }}
              onMouseEnter={() => {
                setShowEditIcon('displayName');
              }}
              onMouseLeave={() => {
                setShowEditIcon(null);
              }}
              className="TbdProfile__DisplayName"
            >
              {displayName}
              <div
                className="TbdProfile__Icon"
                style={showEditIcon !== 'displayName' ? { opacity: 0 } : {}}
              >
                <EditOutlined />
              </div>
            </div>
          )}
          {editable === 'username' ? (
            <div className="TbdProfile__EditUsername EditProp">
              <div className="TbdProfile__InputPrefix" style={{ color: user.color }}>
                @
              </div>
              <input
                autoFocus
                style={{ width: `${(username.length + 1) * 8}px`, color: user.color }}
                className="TbdProfile__Input TbdProfile__Input--username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                }}
                onKeyDown={(e) => handleKeyDown(e, () => updateProfile({ username }))}
              />
              <div className="TbdProfile__Icon" onClick={() => updateProfile({ username })}>
                {loading === 'username' ? <LoadingOutlined /> : <SaveOutlined />}
              </div>
              <div
                className="TbdProfile__Icon TbdProfile__Icon--close"
                onClick={() => setEditable(null)}
              >
                {loading !== 'username' && <CloseOutlined />}
              </div>
            </div>
          ) : (
            <div
              onClick={() => {
                handleEditProperty('username');
              }}
              onMouseEnter={() => {
                setShowEditIcon('username');
              }}
              onMouseLeave={() => {
                setShowEditIcon(null);
              }}
              style={{ color: user.color }}
              className="TbdProfile__Username"
            >
              {`@${username}`}
              <div
                className="TbdProfile__Icon"
                style={showEditIcon !== 'username' ? { opacity: 0 } : {}}
              >
                <EditOutlined />
              </div>
            </div>
          )}
        </div>
      </div> */}
      <div className="TroveProfile__NotionWorkspace">
        <div></div>
      </div>
      {editable === 'color' ? (
        <div className="TbdProfile__Color TbdProfile__EditColor EditProp">
          <div className="TbdProfile__ColorText">
            Accent Color
            {loading === 'color' && (
              <div className="TbdProfile__Loading">
                <LoadingOutlined />
              </div>
            )}
          </div>
          <ColorPicker onSelect={(color) => updateProfile({ color })} defaultColor={user.color} />
        </div>
      ) : (
        <div
          onClick={() => {
            handleEditProperty('color');
          }}
          onMouseEnter={() => {
            setShowEditIcon('color');
          }}
          onMouseLeave={() => {
            setShowEditIcon(null);
          }}
          className="TbdProfile__Color"
        >
          <div className="TbdProfile__ColorText">Accent Color</div>
          <div className="TbdProfile__ColorPreview" style={{ backgroundColor: user.color }} />
          <div className="TbdProfile__Icon" style={showEditIcon !== 'color' ? { opacity: 0 } : {}}>
            <EditOutlined />
          </div>
        </div>
      )}
      <div
        className={`TbdProfile__Error ${
          showError ? 'TbdProfile__Error--show' : 'TbdProfile__Error--hide'
        }`}
      >
        <Alert showIcon message={errorMessage} type="error" className="TbdProfile__Alert" />
      </div>
    </div>
  );
}
