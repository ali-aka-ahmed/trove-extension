import { LoadingOutlined } from '@ant-design/icons';
import { Alert } from 'antd';
import React, { useState } from 'react';
import { IAuthRes } from '../../../app/server/auth';
import { ORIGIN } from '../../../config';
import User from '../../../entities/User';
import { MessageType as EMessageType, sendMessageToWebsite } from '../../../utils/chrome/external';
import { set } from '../../../utils/chrome/storage';
import { MessageType, sendMessageToExtension, SocketMessageType } from '../../../utils/chrome/tabs';
import { createLoginArgs } from '../helpers/auth';
import '../style.scss';
import ForgotPassword from './ForgotPassword';
import './style.scss';

interface LoginProps {}

export default function Login({}: LoginProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleUsernameInput = (e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value);
  const handlePasswordInput = (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value);

  const handleLogin = () => {
    if (username === '') return setErrorMessage('Enter your phone number, email or username');
    if (password === '') return setErrorMessage('Enter your password');
    setLoading(true);
    const args = createLoginArgs(username, password);
    sendMessageToExtension({ type: MessageType.Login, loginArgs: args }).then((res: IAuthRes) => {
      if (!res.success) {
        setLoading(false);
        return setErrorMessage(res.message);
      }
      sendMessageToExtension({ type: SocketMessageType.JoinRoom, userId: res.user?.id });
      sendMessageToWebsite({ type: EMessageType.Login, user: res.user, token: res.token });
      setUsername('');
      setPassword('');
      setLoading(false);
      set({
        user: new User(res.user!),
        token: res.token,
        isExtensionOn: true,
        notificationDisplayIcon: 0
      }).then(() => set({ isAuthenticated: true }));
    })
  }

  const goToSignup = () => chrome.tabs.update({url: ORIGIN});

  if (showForgotPassword) {
    return <ForgotPassword goToLogin={() => setShowForgotPassword(false)} />
  } else return (
    <div className='TbdAuth'>
      <div className='TbdAuth__FieldWrapper'>
        <div className='TbdAuth__Label'>
          Email or username
        </div>
        <div className='TbdAuth__InputWrapper'>
          <input
            className='TbdAuth__Input'
            type='text'
            autoFocus={true}
            value={username}
            onChange={handleUsernameInput}
          />
        </div>
      </div>
      <div className='TbdAuth__FieldWrapper'>
        <div className='TbdAuth__Label'>
          Password
        </div>
        <div className='TbdAuth__InputWrapper'>
          <input
            onChange={handlePasswordInput}
            type='password'
            value={password}
            className='TbdAuth__Input'
            onKeyDown={(e) => { if (e.key === 'Enter') handleLogin()}}
          />
        </div>
        <div className='TbdLogin__ForgotPassword' onClick={() => setShowForgotPassword(true)}>
          Forgot password?
        </div>
      </div>
      <div className='TbdAuth__ButtonWrapper--login'>
      <button
        className='Trove__Button'
        onClick={handleLogin}
      >
        {loading && <div className='TbdAuth__Loading'><LoadingOutlined /></div>}
        Login
      </button>
      {/* <div className='TbdLogin__SignupHere' onClick={goToSignup}>
        or signup here
      </div> */}
      </div>
      <div className={`TbdAuth__Error ${errorMessage 
          ? 'TbdAuth__Error--show' 
          : 'TbdAuth__Error--hide'}`}
      >
        <Alert showIcon message={errorMessage} type='error' className='TbdAuth__Alert' />
      </div>
    </div>
  );
};
